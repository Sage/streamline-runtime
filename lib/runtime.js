"use strict";

exports.regeneratorRuntime = require('regenerator-runtime-only');

var Promise = require("bluebird");

var glob = typeof global === "object" ? global : window;
var secret = "_20c7abceb95c4eb88b7ca1895b1170d1";
var g = (glob[secret] = (glob[secret] || {}));

var tick = 0;

exports.promisify = function(object, property, index) {
	var bound = typeof property !== "function";
	var fn = bound ? object[property] : property;
	var key = 'promised_' + index;
	var promised = fn[key];
	if (promised) return promised;
	promised = function() {
		if (++tick % 1000 === 0) console.log(tick + ": " + fn.name);
		var args = Array.prototype.slice.call(arguments);
		var cx = g.context;
		var promise = new Promise(function(resolve, reject) {
			args.splice(index, 0, function(err, result) {
				//console.error("promisify: result from: " + (fn.name || (typeof property === "string" ? property : "?")) + ': err=' + err + ', result=' + result);
				//if (err) console.error(err.stack);
				g.context = cx;
				setImmediate(function() {
					if (err) reject(err);
					else resolve(result);					
				});
			});
		})
		//console.error("promisify: calling: " + (fn.name || (typeof property === "string" ? property : "?")));
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
		var cb = args.splice(index, 1)[0];
		var self = this;
		var cx = g.context;
		fn.apply(this, args).then(function(result) {
			//console.error("promise resolved: result=" + result);
			g.context = cx;
			cb.call(self, null, result);
		}, function(err) {
			//console.error("promise rejected" + (err && err.stack));
			g.context = cx;
			cb.call(self, err);
		});
	};
	//callbacked['promised_' + index] = fn;
	//fn[key] = callbacked;
	return callbacked;
}

function callbackifyNew(constructor, index) {
	var key = 'callbackedNew_' + index;
	var callbacked = constructor[key];
	if (callbacked) return callbacked;
	callbacked = function() {
		var args = Array.prototype.slice.call(arguments);
		function F() {
			var self = this;
			var cb = args[index];
			var self = this;
			var cx = g.context;
			args.splice(index, 0, function(e, r) {
				//if (e) console.error(err.stack);
				g.context = cx;
				cb.call(self, e, self);
			});
			return constructor.apply(self, args);
		}
		F.prototype = constructor.prototype;
		new F();
	};
	//constructor[key] = callbacked;
	return callbacked;
};

exports.promisifyNew = function(constructor, args, index) {
	return exports.promisify(null, callbackifyNew(constructor, index), index);
}

exports.futurify = function(object, property, index) {
	var bound = typeof property !== "function";
	var fn = bound ? object[property] : property;
	var key = 'futured_' + index;
	var futured = fn[key];
	if (futured) return futured;
	var future = function(fn, args, i) {
		var err, result, done, q = [],
			self = this;
		args = Array.prototype.slice.call(args);
		var self = this;
		var cx = g.context;
		args[i] = function(e, r) {
			//console.error("future: err=" + e + ', result=' + r);
			//if (e) console.error("futurify error", e && e.stack);
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
	};
	//fn[key] = future;
	return future;
}
