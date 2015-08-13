"use strict";

exports.regeneratorRuntime = require('regenerator-runtime-only');

var Promise = require("bluebird");

var glob = typeof global === "object" ? global : window;
var secret = "_20c7abceb95c4eb88b7ca1895b1170d1";
var g = (glob[secret] = (glob[secret] || {}));

exports.promisify = function(object, property, index) {
	var fn = typeof property === "function" ? property : object[property];
	var promised = fn.promised_;
	if (promised) return promised;
	promised = function() {
		var args = Array.prototype.slice.call(arguments);
		var deferred = Promise.pending();
		var cx = g.context;
		args.splice(index, 0, function(err, result) {
			g.context = cx;
			if (err) deferred.reject(err);
			else deferred.resolve(result);
		});
		fn.apply(object, args);
		return deferred.promise;
	};
	fn.promised_ = promised;
	promised['callbacked_' + index] = fn;
	return promised;
};

exports.callbackify = function(fn, index) {
	var key = 'callbacked_' + index;
	var callbacked = fn[key];
	if (callbacked) return callbacked;
	callbacked = function() {
		var args = Array.prototype.slice.call(arguments);
		var cb = args.splice(index, 1)[0];
		var cx = g.context;
		fn.apply(this, args).then(function(result) {
			g.context = cx;
			cb(null, result);
		}, function(err) {
			g.context = cx;
			cb(err);
		});
	}
	callbacked.promised_ = fn;
	fn[key] = callbacked;
	return callbacked;
}