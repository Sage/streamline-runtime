"use strict";

var util = require('./util');
var g = util.getGlobals();

module.exports = function(object, property, index) {
	var bound = typeof property !== "function";
	var fn = bound ? object[property] : property;
	if (typeof fn !== "function") throw new Error("cannot create future", "function", fn);
	return function futured() {
		var err, result, done, q = [],
			self = this;
		var args = Array.prototype.slice.call(arguments);
		var self = this;
		var cx = g.context;
		args[index] = function(e, r) {
			if (e) trace && trace(e);
			err = e;
			result = r;
			done = true;
			q && q.forEach(function(f) {
				if (sync) {
					setImmediate(function() {
						g.context = cx;
						f.call(bound ? object : self, e, r);
					});
				} else {
					g.context = cx;
					f.call(bound ? object : self, e, r);					
				}
			});
			q = null;
		};
		var sync = true;
		fn.apply(bound ? object : self, args);
		sync = false;
		return function future(cb) {
			if (cb === false) return future;
			if (typeof cb !== "function") throw argError(fn.name, index, "function", cb);
			if (done) {
				var cx = g.context;
				g.context = cx;
				cb.call(bound ? object : self, err, result);
			}
			else q.push(cb);
		};
	};
}
