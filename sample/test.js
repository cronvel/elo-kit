#!/usr/bin/env node

"use strict" ;

const elo = require( '..' ) ;
const string = require( 'string-kit' ) ;
const math = require( 'math-kit' ) ;

const termkit = require( 'terminal-kit' ) ;
const term = termkit.terminal ;

var rng = new math.random.Entropy() ;
rng.seed() ;



var cliManager = new elo.Manager( {
	baseElo: 1000 ,
	delta: 100 ,
	deltaOdds: 2 ,
	baseReward: 10 ,
	historySize: 12
} ) ;

var cliPlayerList = require( './players.json' ) ;



function initPlayerList( manager , playerList ) {
	for ( let player of playerList ) {
		initPlayer( manager , player ) ;
	}
}



function initPlayer( manager , player ) {
	player.rating = manager.createRating() ;
	player.count = 0 ;
	player.win = 0 ;
	player.lose = 0 ;
}



function matchMaker( playerList , forPlayer = null ) {
	let a = forPlayer ? playerList.findIndex( v => v === forPlayer ) : rng.random( playerList.length ) ;
	let b = rng.random( playerList.length - 1 ) ;
	if ( b >= a ) { b ++ ; }
	return [ playerList[ a ] , playerList[ b ] ] ;
}



function matchMakerSameLeague( playerList , maxEloDelta = 100 , maxTry = 3 ) {
	let a = rng.random( playerList.length ) ;
	let playerA = playerList[ a ] ;
	let closestEloDelta = Infinity ;
	let closestPlayer = null ;

	for ( let i = 0 ; i < maxTry ; i ++ ) {
		let b = rng.random( playerList.length - 1 ) ;
		if ( b >= a ) { b ++ ; }
		let playerB = playerList[ b ] ;

		let eloDelta = Math.abs( playerA.rating.elo - playerB.rating.elo ) ;
		if ( eloDelta <= maxEloDelta ) {
			return [ playerA , playerB ] ;
		}
		
		if ( eloDelta < closestEloDelta ) {
			closestEloDelta = eloDelta ;
			closestPlayer = playerB ;
		}
	}

	return [ playerA , closestPlayer ] ;
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
		return 1 ;
	}
	else {
		// Player B wins
		//console.log( playerB.name + ' wins against ' + playerA.name ) ;
		manager.registerWin( playerB.rating , playerA.rating ) ;
		playerB.win ++ ;
		playerA.lose ++ ;
		return -1 ;
	}
}



function displayPlayers( playerList ) {
	var sorted = [ ... playerList ].sort( ( a , b ) => b.rating.elo - a.rating.elo ) ;
	//console.log( "\n\n" ) ;

	for ( let player of sorted ) {
		displayPlayer( player ) ;
	}
}



function displayPlayer( player ) {
	term( "%s: ^M%i^ ELO (n:%i w:%i l:%i SK:%i C:%P K:%[.3]f)        ^-Hist: %J\n" ,
		player.name , player.rating.elo ,
		player.count , player.win , player.lose , player.skill ,
		player.rating.confidence , player.rating.k ,
		player.rating.history.map( v => Math.floor( v.score ) )
	) ;
}



async function test( manager , playerList , matchCount = 10 , sameLeague = false ) {
	initPlayerList( manager , playerList ) ;

	for ( let i = 0 ; i < matchCount ; i ++ ) {
		let matchPlayers =
			sameLeague ? matchMakerSameLeague( playerList , 100 , 5 ) :
			matchMaker( playerList ) ;

		match( manager , ... matchPlayers ) ;
	}
	
	displayPlayers( playerList ) ;

	await interactive( manager , playerList ) ;
	term.processExit() ;
}



async function interactive( manager , playerList ) {
	term.on( 'key' , function( key ) {
		switch( key ) {
			case 'CTRL_C' :
				term.processExit() ;
				break ;
		}
	} ) ;

	term( "\nNew Player Name: " ) ;
	var name = await term.inputField().promise || "Nobody" ;
	term( "\nSkill: " ) ;
	var skill = + ( await term.inputField().promise ) || 100 ;
	term( "\n" ) ;
	var player = { name , skill } ;
	initPlayer( manager , player ) ;
	playerList.push( player ) ;

	for ( ;; ) {
		term( "\nAnother match? [y/n] " ) ;
		let more = await term.yesOrNo().promise ;
		term( "\n" ) ;
		if ( ! more ) { return ; }

		let [ , otherPlayer ] = matchMaker( playerList , player ) ;
		term( "%s (^g%i^:|^-%i^:) vs %s (^g%i^:|^-%i^:) => " ,
			player.name , player.rating.elo , player.skill ,
			otherPlayer.name , otherPlayer.rating.elo , otherPlayer.skill
		) ;
		let result = match( manager , player , otherPlayer ) ;
		term( "%s\n" , result > 0 ? 'win' : result < 0 ? 'lose' : 'draw' ) ;
		term( "Aftermath:\n" ) ;
		displayPlayer( player ) ;
		displayPlayer( otherPlayer ) ;
		for ( let entry of player.rating.history ) { term( "%J\n" , entry ) ; }
	}
}



test( cliManager , cliPlayerList , 10000 , false ) ;

