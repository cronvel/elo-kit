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



function Rating( elo , params = {} ) {
	this.elo = elo ?? 1000 ;
	this.k = params.k || 1 ;
	this.eloHistory = [] ;
}

module.exports = Rating ;



Rating.prototype.adjust = function( adjustValue , historySize = 0 ) {
	if ( historySize <= 1 ) {
		this.elo = this.elo + adjustValue ;
		this.eloHistory.length = 0 ;
		return ;
	}

	let newElo = ( this.eloHistory.length ? this.eloHistory[ 0 ] : this.elo ) + adjustValue ;

	this.eloHistory.unshift( newElo ) ;
	if ( this.eloHistory.length > historySize ) { this.eloHistory.length = historySize ; }

	let sum = 0 ;
	for ( let elo of this.eloHistory ) { sum += elo ; }
	this.elo = sum / this.eloHistory.length ;
} ;

