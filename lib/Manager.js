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



const Rating = require( './Rating.js' ) ;



function Manager( params = {} ) {
	this.baseElo = params.baseElo ?? 1000 ;		// Newcomers start at this ELO
	this.delta = params.delta || 100 ;			// 100 points means that the highest rating player...
	this.deltaOdds = params.deltaOdds || 2 ;	// ... has twice the chance to win
	this.baseReward = params.baseReward || 10 ;	// reward for a win against an opponent of the same ELO with K=1
	this.historySize = params.historySize || 0 ;
}

module.exports = Manager ;



Manager.prototype.createRating = function() {
	return new Rating( this.baseElo ) ;
} ;



Manager.prototype.getPowerLevel = function( elo ) {
	return this.baseElo * this.getEloOdds( elo , this.baseElo ) ;
} ;



Manager.prototype.getEloOdds = function( eloA , eloB ) {
	return this.deltaOdds ** ( ( eloA - eloB ) / this.delta ) ;
} ;

Manager.prototype.getOdds = function( ratingA , ratingB ) { return this.getEloOdds( ratingA.elo , ratingB.elo ) ; }



Manager.prototype.getEloWinProbability = function( eloA , eloB ) {
	var odds = this.getEloOdds( eloA , eloB ) ;
	return odds / ( odds + 1 ) ;
} ;

Manager.prototype.getWinProbability = function( ratingA , ratingB ) { return this.getEloWinProbability( ratingA.elo , ratingB.elo ) ; }



Manager.prototype.getEloWinReward = function( winnerElo , loserElo ) {
    var p = this.getEloWinProbability( winnerElo , loserElo ) ;
    var reward = 2 * this.baseReward * ( 1 - p ) ;
    return reward ;
} ;

// Good formula for low ELO delta, but diverge quickly when unexpected outcomes happened
Manager.prototype.getEloWinReward_old = function( winnerElo , loserElo ) {
	var odds = this.getEloOdds( winnerElo , loserElo ) ;
	var reward = this.baseReward / Math.sqrt( odds ) ;
	return reward ;
} ;

Manager.prototype.getWinReward = function( winnerRating , loserRating ) { return this.getEloWinReward( winnerRating.elo , loserRating.elo ) ; }



Manager.prototype.registerWin = function( winnerRating , loserRating ) {
	var reward = this.getEloWinReward( winnerRating.elo , loserRating.elo ) ;
	winnerRating.adjust( reward , this.historySize ) ;
	loserRating.adjust( - reward , this.historySize ) ;
} ;

