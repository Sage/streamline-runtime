"use strict";

var util = require('./util');

module.exports = function (file, line, object, property, index, dummy1, dummy2, args) {
	var bound = typeof property !== "function";
	var fn = bound ? object[property] : property;
	var self = bound ? object : this;
	if (typeof fn !== "function") throw new Error("cannot create future", "function", fn);
	var result = function futured() {
		var err, result, done, q = [];
		var args = Array.prototype.slice.call(arguments);
		var callback = function (e, r) {
			//if (e) console.error(e);
			err = e;
			result = r;
			done = true;
			q && q.forEach(function (f) {
				if (sync) {
					setImmediate(function () {
						f.call(self, e, r);
					});
				} else {
					f.call(self, e, r);
				}
			});
			q = null;
		};
		args[index] = callback;
		var sync = true;
		fn.apply(self, args);
		sync = false;
		var future = function (cb) {
			if (typeof cb !== "function") throw argError(fn.name, index, "function", cb);
			if (done) {
				cb.call(self, err, result);
			}
			else q.push(cb);
		};
		// computed property so that we don't allocate promise if we don't need to
		Object.defineProperty(future, 'promise', {
			get: function () {
				return new Promise(function (resolve, reject) {
					if (done) {
						if (err) reject(err);
						else resolve(result);
					} else {
						q.push(function (e, r) {
							if (e) reject(e);
							else resolve(r);
						})
					}
				});
			}
		});
		return future;
	};
	return Array.isArray(args) ? result.apply(object, args) : result;
}
