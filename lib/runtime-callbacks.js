"use strict";

exports.regeneratorRuntime = require('regenerator-runtime-only');
var Promise = require("bluebird");
var util = require('./util')
// forceImmediate:
//	0 to disable
//	1 to force on every call
//	2 to force setImmediate instead of nextTick

var forceImmediate = 1; 
if (forceImmediate === 2) process.nextTick = setImmediate;

var g = util.getGlobals('fibers');

exports.promisify = function(object, property, index) {
	var bound = typeof property !== "function";
	var fn = bound ? object[property] : property;
	if (typeof fn !== "function") throw util.typeError("cannot promisify function", "function", fn);
	var key = 'promised_' + index;
	var promised = fn[key];
	if (promised) return promised;
	promised = function promised() {
		var args = Array.prototype.slice.call(arguments),
			arg = args[index];
		if (typeof arg !== 'boolean') throw util.argError("promised(" + fn.name + ")", index, 'boolean', arg);
		var cx = g.context;
		var promise = new Promise(function(resolve, reject) {
			args[index] = function(err, result) {
				if (err) trace && trace(err);
				if (sync || forceImmediate === 1) {
					setImmediate(function() {
						g.context = cx;
						if (err) reject(err);
						else resolve(result);					
					});
				} else {
					g.context = cx;
					if (err) reject(err);
					else resolve(result);										
				}
			};
		})
		var sync = true;
		fn.apply(bound ? object: this, args);
		sync = false;
		return promise;
	};
	if (!bound) {
		fn[key] = promised;
		promised['callbacked_' + index] = fn;
	}
	return promised;
};


exports.callbackify = function(fn, index) {
	if (typeof fn !== "function") throw util.typeError("cannot callbackify function", "function", fn);
	var key = 'callbacked_' + index;
	var callbacked = fn[key];
	if (callbacked) return callbacked;
	callbacked = function callbacked() {
		var self = this;
		var args = Array.prototype.slice.call(arguments);
		var cb = args[index];
		if (typeof cb !== "function") {
			// if cb is false, return a future
			if (cb === false) return future(null, callbacked.bind(self), args);
			throw util.argError(fn.name, index, "function", typeof cb);
		}
		var cx = g.context;
		fn.apply(this, args).then(function(result) {
			g.context = cx;
			cb.call(self, null, result);
		}, function(err) {
			trace && trace(err);
			g.context = cx;
			cb.call(self, err);
		});
	};
	callbacked['promised_' + index] = fn;
	fn[key] = callbacked;
	return callbacked;
}

exports.promisifyNew = function(constructor, index) {
	if (typeof constructor !== "function") throw util.typeError("cannot promisify constructor", "function", constructor);
	var key = 'promisedNew_' + index;
	var promised = constructor[key];
	if (promised) return promised;
	promised = function promisedNew() {
		var args = Array.prototype.slice.call(arguments);
		function promisedConstructor() {
			var self = this;
			var arg = args[index];
			if (arg !== true) throw util.argError(constructor.name, index, "true", arg);
			var self = this;
			var cx = g.context;
			var promise = new Promise(function(resolve, reject) {
				args[index] = function(err) {
					if (err) trace && trace(err);
					if (sync || forceImmediate === 1) {
						setImmediate(function() {
							g.context = cx;
							if (err) reject(err);
							else resolve(self);
						});
					} else {
						g.context = cx;
						if (err) reject(err);
						else resolve(self);						
					}
				};
			});
			var sync = true;
			constructor.apply(self, args);
			sync = false;
			return promise;
		}
		promisedConstructor.prototype = constructor.prototype;
		return new promisedConstructor();
	};
	constructor[key] = promised;
	return promised;
};

exports.future = require('./future');