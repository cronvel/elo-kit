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



Rating.prototype.updateConfidence = function( date = new Date() ) {
	var sum = 0 ;

	for ( let entry of this.history ) {
		let age = ( date - entry.date ) / 1000 ;
		if ( age <= this.manager.confidenceTime ) { sum ++ ; }
		else { sum += this.manager.confidenceTime / age ; }
	}

	this.confidence = sum / this.history.length ;
	let uncertainty = ( 1 - this.confidence ) ** 2 ;
	this.k = 1 + ( this.manager.kMax - 1 ) * uncertainty ;

	this.lastUpdate = date ;
} ;



Rating.prototype.adjust = function( adjustValue , date = new Date() ) {
	this.score += adjustValue ;

	if ( this.manager.historySize <= 1 ) {
		this.elo = this.score ;
		this.history.length = 0 ;
		return ;
	}

	this.history.unshift( new HistoryEntry( this.score , date ) ) ;

	if ( this.history.length > this.manager.historySize ) {
		this.history.length = this.manager.historySize ;
	}

	let scoreSum = 0 ;
	for ( let entry of this.history ) { scoreSum += entry.score ; }
	this.elo = scoreSum / this.history.length ;
} ;



function HistoryEntry( score , date ) {
	if ( score && typeof score === 'object' ) {
		( { score , date } = score ) ;
	}

	this.score = score ;
	this.date = date ;
}

Rating.HistoryEntry = HistoryEntry ;

