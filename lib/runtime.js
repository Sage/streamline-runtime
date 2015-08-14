"use strict";

exports.regeneratorRuntime = require('regenerator-runtime-only');

var Promise = require("bluebird");

var glob = typeof global === "object" ? global : window;
var secret = "_20c7abceb95c4eb88b7ca1895b1170d1";
var g = (glob[secret] = (glob[secret] || {}));

exports.promisify = function(object, property, index) {
	var bound = typeof property !== "function";
	var fn = bound ? object[property] : property;
	var key = 'promised_' + index;
	var promised = fn[key];
	if (promised) return promised;
	promised = function() {
		var args = Array.prototype.slice.call(arguments);
		var cx = g.context;
		var promise = new Promise(function(resolve, reject) {
			args[index] = function(err, result) {
				setImmediate(function() {
					g.context = cx;
					if (err) reject(err);
					else resolve(result);					
				});
			};
		})
		fn.apply(bound ? object: this, args);
		return promise;
	};
	//fn[key] = promised;
	//promised['callbacked_' + index] = fn;
	return promised;
};


exports.callbackify = function(fn, index) {
	var key = 'callbacked_' + index;
	var callbacked = fn[key];
	if (callbacked) return callbacked;
	callbacked = function() {
		var args = Array.prototype.slice.call(arguments);
		var cb = args[index];
		var self = this;
		var cx = g.context;
		fn.apply(this, args).then(function(result) {
			g.context = cx;
			cb.call(self, null, result);
		}, function(err) {
			g.context = cx;
			cb.call(self, err);
		});
	};
	//callbacked['promised_' + index] = fn;
	//fn[key] = callbacked;
	return callbacked;
}

exports.promisifyNew = function(constructor, index) {
	var key = 'promisedNew_' + index;
	var promised = constructor[key];
	if (promised) return promised;
	promised = function() {
		var args = Array.prototype.slice.call(arguments);
		function F() {
			var self = this;
			var cb = args[index];
			var self = this;
			var cx = g.context;
			var promise = new Promise(function(resolve, reject) {
				args[index] = function(err) {
					g.context = cx;
					if (err) reject(err);
					else resolve(self);
				};
			});
			constructor.apply(self, args);
			return promise;
		}
		F.prototype = constructor.prototype;
		return new F();
	};
	//constructor[key] = promised;
	return promised;
};

exports.future = function(object, property, index) {
	var bound = typeof property !== "function";
	var fn = bound ? object[property] : property;
	var err, result, done, q = [],
		self = this;
	var args = Array.prototype.slice.call(arguments);
	var self = this;
	var cx = g.context;
	args[index] = function(e, r) {
		g.context = cx;
		err = e;
		result = r;
		done = true;
		q && q.forEach(function(f) {
			f.call(bound ? object : self, e, r);
		});
		q = null;
	};
	fn.apply(bound ? object : self, args);
	return function F(cb) {
		if (!cb) return F;
		if (done) cb.call(bound ? self : self, err, result);
		else q.push(cb);
	};
}
