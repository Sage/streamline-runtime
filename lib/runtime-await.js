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

exports.await = function(object, property, index) {
	var bound = typeof property !== "function";
	var fn = bound ? object[property] : property;
	if (typeof fn !== "function") throw util.typeError("cannot call", "function", fn);
	var key = 'awaitWrapper_' + index;
	var awaitWrapper = fn[key];
	if (awaitWrapper) return awaitWrapper;
	awaitWrapper = function awaitWrapper() {
		var args = Array.prototype.slice.call(arguments),
			arg = args[index];
		if (typeof arg !== 'boolean') throw util.argError(fn.name, index, 'boolean', arg);
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
		fn[key] = awaitWrapper;
		awaitWrapper['asyncWrapper_' + index] = fn;
	}
	return awaitWrapper;
};


exports.async = function(fn, index) {
	if (typeof fn !== "function") throw util.typeError("cannot wrap function", "function", fn);
	var key = 'asyncWrapper_' + index;
	var asyncWrapper = fn[key];
	if (asyncWrapper) return asyncWrapper;
	asyncWrapper = function asyncWrapper() {
		var self = this;
		var args = Array.prototype.slice.call(arguments);
		var cb = args[index];
		if (typeof cb !== "function") {
			// if cb is false, return a future
			if (cb === false) return future(null, asyncWrapper.bind(self), args);
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
	asyncWrapper['awaitWrapper_' + index] = fn;
	fn[key] = asyncWrapper;
	return asyncWrapper;
}

exports.new = function(constructor, index) {
	if (typeof constructor !== "function") throw util.typeError("cannot instantiate", "function", constructor);
	var key = 'newWrapper_' + index;
	var newWrapper = constructor[key];
	if (newWrapper) return newWrapper;
	newWrapper = function newWrapper() {
		var args = Array.prototype.slice.call(arguments);
		function Constructor() {
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
		Constructor.prototype = constructor.prototype;
		return new Constructor();
	};
	constructor[key] = newWrapper;
	return newWrapper;
};

exports.future = require('./future');