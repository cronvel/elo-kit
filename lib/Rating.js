/*
	ELO Kit

	Copyright (c) 2024 Cédric Ronvel

	The MIT License (MIT)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/

"use strict" ;



function Rating( manager , params = {} ) {
	this.elo = params.elo ?? manager.baseElo ?? 1000 ;	// Elo is the most accurate measure of the skill, it's the mean of the score history
	this.score = params.score ?? this.elo ;		// It is adjusted immediately
	this.confidence = params.confidence ?? 0 ;	// Confidence of the elo, from 0 to 1
	this.k = params.k ?? 1 ;	// How much the elo is moving, ≥ 1, the more confidence, the less k

	this.history = params.history ? params.history.map( v => new HistoryEntry( v ) ) : [] ;	// Each entry is a score and a date

	this.lastUpdate = params.lastUpdate || new Date() ;

	Object.defineProperty( this , 'manager' , { value: manager } ) ;
}

module.exports = Rating ;



Rating.prototype.adjust = function( adjustValue , gameData ) {
	this.score += adjustValue ;

	if ( this.manager.historySize <= 1 ) {
		this.elo = this.score ;
		this.history.length = 0 ;
		return ;
	}

	this.history.unshift( new HistoryEntry( {
		result: gameData.result ,
		adjust: adjustValue ,
		score: this.score ,
		confidence: gameData.confidence ,
		date: gameData.date ,
		initialElo: gameData.initialElo ,
		initialOpponentElo: gameData.initialOpponentElo ,
	} ) ) ;

	if ( this.history.length > this.manager.historySize ) {
		this.history.length = this.manager.historySize ;
	}

	this.updateStableElo( adjustValue ) ;
} ;



// adjustValue is used to avoid ELO from falling when improving or climbing when failing
Rating.prototype.updateStableElo = function( adjustValue = 0 ) {
	var newElo ,
		decayIndex = this.history.length / 2 ,
		scoreSum = 0 ,
		weightSum = 0 ;

	for ( let i = 0 ; i < this.history.length ; i ++ ) {
		let entry = this.history[ i ] ;
		let weight = entry.confidence ;

		// The second half of the history has a decaying weight, this avoid big variation
		// when an extremum is removed from the history, because its weight was already low.
		if ( i > decayIndex ) { weight *= ( this.history.length - i ) / decayIndex ; }

		scoreSum += entry.score * weight ;
		weightSum += weight ;
	}

	newElo = scoreSum / weightSum ;

	// Only update if the new ELO go to the same direction than the adjust value, because it's the sliding average
	// of a score history, it is possible to climb while losing or to fall while winning.
	if ( ( adjustValue > 0 && newElo > this.elo ) || ( adjustValue < 0 && newElo < this.elo ) ) {
		this.elo = newElo ;
	}
} ;



// Get the virtual ELO performance of the history
Rating.prototype.getRetroElo = function( retroElo = this.elo , iteration = 3 ) {
	if ( this.manager.historySize < 2 ) { return ; }

	for ( let i = 0 ; i < iteration ; i ++ ) {
		let winSum = 0 ,
			loseSum = 0 ;

		for ( let entry of this.history ) {
			let winProbability = this.manager.getEloWinProbability( retroElo , entry.initialOpponentElo ) ;

			if ( entry.result > 0 ) { winSum += 1 - winProbability ; }
			else if ( entry.result < 0 ) { loseSum += winProbability ; }
			// else {  // for instance the lib does not support draw games
		}

		if ( ! winSum || ! loseSum ) {
			// We need at least one victory and one defeat to compute the retro ELO,
			// if not, we simulate a victory and a defeat against itself, with a varying weight.
			let bias = ( ( i + 1 ) / iteration ) ** 2 ;
			winSum += bias ;
			loseSum += bias ;
		}

		let odds = winSum / loseSum ;
		retroElo = this.manager.getEloFromOddsAgainstElo( odds , retroElo ) ;
		console.log( "RETRO ELO:" , winSum , loseSum , odds , " => " , retroElo ) ;
	}

	return retroElo ;
} ;



Rating.prototype.updateConfidence = function( date = new Date() ) {
	this.lastUpdate = date ;

	if ( this.manager.historySize <= 1 ) {
		this.confidence = 1 ;
		this.k = 1 ;
		return ;
	}

	let sum = 0 ;

	for ( let entry of this.history ) {
		let ageFactor = 1 ;
		let age = ( date - entry.date ) / 1000 ;
		if ( age > this.manager.confidenceTime ) { ageFactor = this.manager.confidenceTime / age ; }
		sum += entry.confidence * ageFactor ;
	}

	this.confidence = sum / this.manager.historySize ;
	let uncertainty = ( 1 - this.confidence ) ** 2 ;
	this.k = 1 + ( this.manager.kMax - 1 ) * uncertainty ;
} ;



function HistoryEntry( params ) {
	this.result = params.result ;
	this.adjust = params.adjust ;
	this.score = params.score ;
	this.confidence = params.confidence ;
	this.date = params.date ;
	this.initialElo = params.initialElo ;
	this.initialOpponentElo = params.initialOpponentElo ;
}

Rating.HistoryEntry = HistoryEntry ;

