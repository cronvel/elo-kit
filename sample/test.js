#!/usr/bin/env node

const elo = require( '..' ) ;

var manager = new elo.Manager( {
	baseElo: 1000 ,
	delta: 100 ,
	deltaOdds: 2 ,
	baseReward: 10
} ) ;



