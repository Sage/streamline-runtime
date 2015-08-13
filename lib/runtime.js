"use strict";

exports.regeneratorRuntime = require('regenerator-runtime-only');

var Promise = require("bluebird");

exports.promisify = function(object, property, index) {
	// TODO: use faster promisify when _ is last arg
	var fn = typeof property === "function" ? property : object[property];
	return function() {
		var args = Array.prototype.slice.call(arguments);
		var deferred = Promise.pending();
		args.splice(index, 0, function(err, result) {
			if (err) deferred.reject(err);
			else deferred.resolve(result);
		});
		fn.apply(object, args);
		return deferred.promise;
	};
};

exports.callbackify = function(fn, index) {
	var F = function() {
		var args = Array.prototype.slice.call(arguments);
		var cb = args.splice(index, 1)[0];
		fn.apply(this, args).then(function(result) {
			cb(null, result);
		}, function(err) {
			cb(err);
		});
	}
	return F;
}