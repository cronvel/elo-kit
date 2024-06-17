#!/usr/bin/env node

"use strict" ;

const elo = require( '..' ) ;
const string = require( 'string-kit' ) ;
const math = require( 'math-kit' ) ;

var rng = new math.random.Entropy() ;
rng.seed() ;




var cliManager = new elo.Manager( {
	baseElo: 1000 ,
	delta: 100 ,
	deltaOdds: 2 ,
	baseReward: 10 ,
	historySize: 10
} ) ;

var cliPlayerList = require( './players.json' ) ;




function initPlayerList( manager , playerList ) {
	for ( let player of playerList ) {
		player.rating = new manager.createRating() ;
		player.count = 0 ;
		player.win = 0 ;
		player.lose = 0 ;
	}
}



function matchMaker( playerList ) {
	let a = rng.random( playerList.length ) ;
	let b = rng.random( playerList.length - 1 ) ;
	if ( b >= a ) { b ++ ; }
	return [ playerList[ a ] , playerList[ b ] ] ;
}



function match( manager , playerA , playerB ) {
	var winChanceA = playerA.skill / ( playerA.skill + playerB.skill ) ;
	//console.log( "Win chance for" , playerA.name , "against" , playerB.name , ":" , winChanceA ) ;

	playerA.count ++ ;
	playerB.count ++ ;

	if ( rng.random() < winChanceA ) {
		// Player A wins
		//console.log( playerA.name + ' wins against ' + playerB.name ) ;
		manager.registerWin( playerA.rating , playerB.rating ) ;
		playerA.win ++ ;
		playerB.lose ++ ;
	}
	else {
		// Player B wins
		//console.log( playerB.name + ' wins against ' + playerA.name ) ;
		manager.registerWin( playerB.rating , playerA.rating ) ;
		playerB.win ++ ;
		playerA.lose ++ ;
	}
}



function displayPlayers( playerList ) {
	var sorted = [ ... playerList ].sort( ( a , b ) => b.rating.elo - a.rating.elo ) ;
	//console.log( "\n\n" ) ;

	for ( let player of sorted ) {
		console.log(
			string.format(
				"%s: %i ELO (c:%i w:%i l:%i SK:%i)        Hist: %J" ,
				player.name , player.rating.elo ,
				player.count , player.win , player.lose , player.skill ,
				player.rating.eloHistory.map( v => Math.floor( v ) )
			)
		) ;
	}
}



function test( manager , playerList , count = 10 ) {
	initPlayerList( manager , playerList ) ;

	for ( let i = 0 ; i < count ; i ++ ) {
		let matchPlayers = matchMaker( playerList ) ;
		match( manager , ... matchPlayers ) ;
	}
	
	console.log( "\n" ) ;
	displayPlayers( playerList ) ;
	console.log( "\n" ) ;
}



test( cliManager , cliPlayerList , 10000 ) ;

