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

/* global expect, describe, it, before, after */



const elo = require( '..' ) ;
const Manager = elo.Manager ;
const Rating = elo.Rating ;



describe( "Internal API" , () => {
	
	it( "Compute odds" , () => {
		var manager = new Manager( {
			delta: 100 ,
			deltaOdds: 2
		} ) ;
		//log( "Manager: %I" , manager ) ;

		expect( manager.getEloOdds( 1200 , 1100 ) ).to.be( 2 ) ;
		expect( manager.getEloOdds( 600 , 500 ) ).to.be( 2 ) ;
		expect( manager.getEloOdds( 2600 , 2500 ) ).to.be( 2 ) ;
		expect( manager.getEloOdds( 1100 , 1200 ) ).to.be( 0.5 ) ;

		expect( manager.getEloOdds( 1400 , 1200 ) ).to.be( 4 ) ;
		expect( manager.getEloOdds( 1500 , 1200 ) ).to.be( 8 ) ;
		expect( manager.getEloOdds( 1600 , 1200 ) ).to.be( 16 ) ;
		expect( manager.getEloOdds( 1700 , 1200 ) ).to.be( 32 ) ;
		expect( manager.getEloOdds( 1800 , 1200 ) ).to.be( 64 ) ;

		expect( manager.getEloOdds( 1400 , 1375 ) ).to.be.around( 1.189207115002721 ) ;
		expect( manager.getEloOdds( 1400 , 1350 ) ).to.be.around( 1.4142135623730951 ) ;
		expect( manager.getEloOdds( 1400 , 1325 ) ).to.be.around( 1.6817928305074292 ) ;
		expect( manager.getEloOdds( 1400 , 1250 ) ).to.be.around( 2.82842712474619 ) ;
	} ) ;

	it( "Compute power level" , () => {
		var manager = new Manager( {
			delta: 100 ,
			deltaOdds: 2
		} ) ;

		expect( Math.round( manager.getPowerLevel( 650 ) ) ).to.be( 88 ) ;
		expect( Math.round( manager.getPowerLevel( 750 ) ) ).to.be( 177 ) ;
		expect( manager.getPowerLevel( 800 ) ).to.be( 250 ) ;
		expect( manager.getPowerLevel( 900 ) ).to.be( 500 ) ;
		expect( manager.getPowerLevel( 1000 ) ).to.be( 1000 ) ;
		expect( Math.round( manager.getPowerLevel( 1050 ) ) ).to.be( 1414 ) ;
		expect( manager.getPowerLevel( 1100 ) ).to.be( 2000 ) ;
		expect( Math.round( manager.getPowerLevel( 1150 ) ) ).to.be( 2828 ) ;
		expect( manager.getPowerLevel( 1200 ) ).to.be( 4000 ) ;
		expect( Math.round( manager.getPowerLevel( 1250 ) ) ).to.be( 5657 ) ;
		expect( Math.round( manager.getPowerLevel( 1400 ) ) ).to.be( 16000 ) ;
		expect( Math.round( manager.getPowerLevel( 1430 ) ) ).to.be( 19698 ) ;
		expect( Math.round( manager.getPowerLevel( 1437 ) ) ).to.be( 20678 ) ;
	} ) ;

	it( "Compute ELO reward" , () => {
		var manager = new Manager( {
			delta: 100 ,
			deltaOdds: 2 ,
			baseReward: 10
		} ) ;

		expect( manager.getEloWinReward( 1000 , 1000 ) ).to.be( 10 ) ;

		expect( manager.getEloWinReward( 1050 , 1000 ) ).to.be.around( 8.284271247461898 ) ;
		expect( manager.getEloWinReward( 1000 , 1050 ) ).to.be.around( 11.7157287525381 ) ;
		expect( manager.getEloWinReward( 1000 , 1050 ) / manager.getEloWinReward( 1050 , 1000 ) ).to.be.around( 1.4142135623730951 ) ;

		expect( manager.getEloWinReward( 1100 , 1000 ) ).to.be.around( 6.666666666666668 ) ;
		expect( manager.getEloWinReward( 1000 , 1100 ) ).to.be.around( 13.333333333333336 ) ;
		expect( manager.getEloWinReward( 1000 , 1100 ) / manager.getEloWinReward( 1100 , 1000 ) ).to.be.around( 2 ) ;

		expect( manager.getEloWinReward( 1150 , 1000 ) ).to.be.around( 5.224077499274829 ) ;
		expect( manager.getEloWinReward( 1000 , 1150 ) ).to.be.around( 14.775922500725171 ) ;
		expect( manager.getEloWinReward( 1000 , 1150 ) / manager.getEloWinReward( 1150 , 1000 ) ).to.be.around( 2.8284271247461903 ) ;

		expect( manager.getEloWinReward( 1200 , 1000 ) ).to.be.around( 4 ) ;
		expect( manager.getEloWinReward( 1000 , 1200 ) ).to.be.around( 16 ) ;
		expect( manager.getEloWinReward( 1000 , 1200 ) / manager.getEloWinReward( 1200 , 1000 ) ).to.be.around( 4 ) ;

		expect( manager.getEloWinReward( 1300 , 1000 ) ).to.be.around( 2.222222222222223 ) ;
		expect( manager.getEloWinReward( 1000 , 1300 ) ).to.be.around( 17.77777777777778 ) ;
		expect( manager.getEloWinReward( 1000 , 1300 ) / manager.getEloWinReward( 1300 , 1000 ) ).to.be.around( 8 ) ;

		expect( manager.getEloWinReward( 1400 , 1000 ) ).to.be.around( 1.1764705882352944 ) ;
		expect( manager.getEloWinReward( 1000 , 1400 ) ).to.be.around( 18.823529411764707 ) ;
		expect( manager.getEloWinReward( 1000 , 1400 ) / manager.getEloWinReward( 1400 , 1000 ) ).to.be.around( 16 ) ;
	} ) ;
} ) ;

