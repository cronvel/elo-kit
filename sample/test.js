#!/usr/bin/env node

const elo = require( '..' ) ;

var manager = new elo.Manager( {
	baseElo: 1000 ,
	delta: 100 ,
	deltaOdds: 2 ,
	baseReward: 10
} ) ;

var players = require( './players.json' ) ;

for ( let player of players ) {
	player.rating = new manager.createRating() ;
}

for ( let i = 0 ; i < 100 ; i ++ ) {
	let a = Math.floor( Math.random() * players.length ) ;
	let b = Math.floor( Math.random() * ( players.length - 1 ) ) ;
	if ( b >= a ) { b ++ ; }
	let playerA = players[ a ] ;
	let playerB = players[ b ] ;
}


