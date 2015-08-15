"use strict";
var colors = require('colors/safe');

function log(message) {
	console.log(colors.green("[STREAMLINE-RUNTIME] " + message));
}
function warn(message) {
	console.warn(colors.yellow("[STREAMLINE-RUNTIME] " + message));
}
function error(message) {
	console.error(colors.red("[STREAMLINE-RUNTIME] " + message));
}

function trace(obj) {
	if (obj instanceof TypeError) util.error(obj.stack);
	//else console.error(obj);
};

function typeName(val) {
	return val === null ? "null" : typeof val;
}

function typeError(message, expected, got) {
	return new TypeError(message + ": expected " + expected + ", got " + typeName(got));
}

function argError(fname, index, expected, got) {
	console.error(new Error().stack);
	return typeError("invalid argument " + index + " to function `" + fname + "`", expected, got);
}

function getGlobals(runtime) {
	var glob = typeof global === "object" ? global : window;
	var secret = "_20c7abceb95c4eb88b7ca1895b1170d1";
	var g = (glob[secret] = (glob[secret] || {}));
	if (runtime && g.runtime && g.runtime !== runtime) 
		console.warn("[STREAMLINE-RUNTIME] " + runtime + " runtime loaded on top of " + g.runtime);
	return g;
}

module.exports = {
	log: log,
	warn: warn,
	error: error,
	trace: trace,
	typeName: typeName,
	typeError: typeError,
	argError: argError,
	getGlobals: getGlobals,
};
var util = module.exports;
