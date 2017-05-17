"use strict";

// Do not use this one directly, require it through the flows module.
module.exports = function funnel(max) {
	max = max == null ? -1 : max;
	if (max === 0) max = module.exports.defaultSize;
	if (typeof max !== "number") throw new Error("bad max number: " + max);
	var queue = [],
		active = 0,
		closed = false;

	var fun = function (callback, fn) {
		if (callback == null) return future(fun, arguments, 0);
		//console.log("FUNNEL: active=" + active + ", queued=" + queue.length);
		if (max < 0 || max === Infinity) return fn(callback);

		queue.push({
			fn: fn,
			cb: callback
		});

		function _doOne() {
			var current = queue.splice(0, 1)[0];
			if (!current.cb) return current.fn();
			active++;
			current.fn(function (err, result) {
				active--;
				if (!closed) {
					current.cb(err, result);
					while (active < max && queue.length > 0) _doOne();
				}
			});
		}

		while (active < max && queue.length > 0) _doOne();
	};

	fun.close = function () {
		queue = [];
		closed = true;
	};
	return fun;
};
module.exports.defaultSize = 4;