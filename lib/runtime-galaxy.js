"use strict";

var galaxy = require('galaxy');
require('streamline/lib/util/builtins');
var util = require('./util');

var g = util.getGlobals('galaxy');

exports.await = function(object, property, index) {
	var bound = typeof property !== "function";
	var that = bound ? object : null;
	var fn = bound ? object[property] : property;
	if (typeof fn !== "function") throw util.typeError("cannot call", "function", fn);
	return galaxy.star(fn, index).bind(that);
};

exports.async = function(fn, index) {
	if (typeof fn !== "function") throw util.typeError("cannot wrap function", "function", fn);
	return galaxy.unstar(fn, index);
}

exports.new = function fiberifyNew(constructor, index) {
	if (typeof constructor !== "function") throw util.typeError("cannot instantiate", "function", constructor);
	return galaxy.new(fn, index);
};

exports.future = require('./future');