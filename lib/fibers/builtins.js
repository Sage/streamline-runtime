"use strict";

var _streamline = typeof require === 'function' ? require("streamline-runtime/lib/fibers/runtime") : Streamline.require("streamline-runtime/lib/fibers/runtime");

var _filename = "builtins._js";
/**
 * Copyright (c) 2012 Bruno Jouhier <bruno.jouhier@sage.com>
 * MIT License
 */
/// !doc
/// 
/// # Streamline built-ins
///  
(function (exports) {
	var _parallel = function _parallel(options) {
		if (typeof options === "number") return options;
		if (typeof options.parallel === "number") return options.parallel;
		return options.parallel ? -1 : 1;
	};

	var VERSION = 3;

	var future = function future(fn, args, i) {
		var err,
		    result,
		    done,
		    q = [],
		    self = this;
		args = Array.prototype.slice.call(args);
		args[i] = function (e, r) {
			err = e;
			result = r;
			done = true;
			q && q.forEach(function (f) {
				f.call(self, e, r);
			});
			q = null;
		};
		fn.apply(this, args);
		return function F(cb) {
			if (!cb) return F;
			if (done) cb.call(self, err, result);else q.push(cb);
		};
	};

	var funnel = function funnel(max) {
		var _doOne = function _doOne() {
			var current = queue.shift();
			if (!current.cb) return current.fn();
			active++;
			current.fn(function (err, result) {
				active--;
				if (!closed) {
						current.cb(err, result);
						while (active < max && queue.length > 0) {
							_doOne();
						}
					}
			});
		};

		var overflow = function overflow(callback, fn) {
			queue.push({
				fn: fn,
				cb: callback
			});
		};

		max = max == null ? -1 : max;
		if (max === 0) max = exports.funnel.defaultSize;
		if (typeof max !== "number") throw new Error("bad max number: " + max);
		var queue = [],
		    active = 0,
		    closed = false;

		var fun = _streamline.async(function _$$$$(_2, fn) {
			{
				//console.log("FUNNEL: active=" + active + ", queued=" + queue.length);
				if (max < 0 || max === Infinity) return _streamline.await(_filename, 64, null, fn, 0, null, false, [true]);
				// optimization to avoid _ -> callback transition in fibers mode when the funnel is available.
				if (active < max) {
						active++;
						try {
							return _streamline.await(_filename, 69, null, fn, 0, null, false, [true]);
						} finally {
							active--;
							while (active < max && queue.length > 0) {
								_doOne();
							}
						}
					} else {
						return _streamline.await(_filename, 75, null, overflow, 0, null, false, [true, fn]);
					}
			}
		}, 0, 2);

		fun.close = function () {
			queue = [];
			closed = true;
		};
		return fun;
	};
	funnel.defaultSize = 4;

	exports.funnel = funnel;

	if (Array.prototype.forEach_ && Array.prototype.forEach_.version_ >= VERSION) return;

	// bail out (silently) if JS does not support defineProperty (IE 8).
	try {
		Object.defineProperty({}, 'x', {});
	} catch (e) {
		return;
	}

	var has = Object.prototype.hasOwnProperty;

	/* eslint-disable no-extend-native */

	/// ## Array functions  
	/// 
	/// These functions are asynchronous variants of the EcmaScript 5 Array functions.
	/// 
	/// Common Rules: 
	/// 
	/// These variants are postfixed by an underscore.  
	/// They take the `_` callback as first parameter.  
	/// They pass the `_` callback as first argument to their `fn` callback.  
	/// Most of them have an optional `options` second parameter which controls the level of 
	/// parallelism. This `options` parameter may be specified either as `{ parallel: par }` 
	/// where `par` is an integer, or directly as a `par` integer value.  
	/// The `par` values are interpreted as follows:
	/// 
	/// * If absent or equal to 1, execution is sequential.
	/// * If > 1, at most `par` operations are parallelized.
	/// * if 0, a default number of operations are parallelized. 
	///   This default is defined by `flows.funnel.defaultSize` (4 by default - see `flows` module).
	/// * If < 0 or Infinity, operations are fully parallelized (no limit).
	/// 
	/// Functions:
	/// 
	/// * `array.forEach_(_[, options], fn[, thisObj])`  
	///   `fn` is called as `fn(_, elt, i, array)`.
	delete Array.prototype.forEach_;
	Object.defineProperty(Array.prototype, 'forEach_', {
		configurable: true,
		writable: true,
		enumerable: false,
		value: _streamline.async(function _$$value$$(_3, options, fn, thisObj) {
			{
				if (typeof options === "function") {
						thisObj = fn;
						fn = options;
						options = 1;
					}
				var par = _parallel(options);
				thisObj = thisObj !== undefined ? thisObj : this;
				var len = this.length;
				if (par === 1 || len <= 1) {
						for (var i = 0; i < len; i++) {
							if (has.call(this, i)) _streamline.await(_filename, 148, fn, "call", 1, null, false, [thisObj, true, this[i], i, this]);
						}
					} else {
						_streamline.await(_filename, 151, this, "map_", 0, null, false, [true, par, fn, thisObj]);
					}
				return this;
			}
		}, 0, 4)
	});
	Array.prototype.forEach_.version_ = VERSION;
	/// * `result = array.map_(_[, options], fn[, thisObj])`  
	///   `fn` is called as `fn(_, elt, i, array)`.
	delete Array.prototype.map_;
	Object.defineProperty(Array.prototype, 'map_', {
		configurable: true,
		writable: true,
		enumerable: false,
		value: _streamline.async(function _$$value$$2(_4, options, fn, thisObj) {
			var _this = this;

			{
				if (typeof options === "function") {
						thisObj = fn;
						fn = options;
						options = 1;
					}
				var par = _parallel(options);
				thisObj = thisObj !== undefined ? thisObj : this;
				var len = this.length;
				var result, i;
				if (par === 1 || len <= 1) {
						result = new Array(len);
						for (i = 0; i < len; i++) {
							if (has.call(this, i)) result[i] = _streamline.await(_filename, 177, fn, "call", 1, null, false, [thisObj, true, this[i], i, this]);
						}
					} else {
						var futures = [];
						i = 0;
						result = new Array(len);
						if (par <= 0) par = len;
						// cap with a hard limit to avoid memory issue with fibers
						par = Math.min(par, 256);
						for (var j = 0; j < par; j++) {
							futures[j] = _streamline.future(_filename, 186, null, _streamline.async(function _$$$$2(_5) {
								{
									while (i < _this.length) {
										var k = i++;
										if (has.call(_this, k)) result[k] = _streamline.await(_filename, 189, fn, "call", 1, null, false, [thisObj, true, _this[k], k, _this]);
									}
								}
							}, 0, 1), 0, null, false, [false]);
						}for (var j = 0; j < par; j++) {
							_streamline.await(_filename, 192, futures, j, 0, null, false, [true]);
						}
					}
				return result;
			}
		}, 0, 4)
	});
	/// * `result = array.filter_(_[, options], fn[, thisObj])`  
	///   `fn` is called as `fn(_, elt, i, array)`.
	delete Array.prototype.filter_;
	Object.defineProperty(Array.prototype, 'filter_', {
		configurable: true,
		writable: true,
		enumerable: false,
		value: _streamline.async(function _$$value$$3(_6, options, fn, thisObj) {
			{
				if (typeof options === "function") {
						thisObj = fn;
						fn = options;
						options = 1;
					}
				var par = _parallel(options);
				thisObj = thisObj !== undefined ? thisObj : this;
				var result = [];
				var len = this.length;
				if (par === 1 || len <= 1) {
						for (var i = 0; i < len; i++) {
							if (has.call(this, i)) {
									var elt = this[i];
									if (_streamline.await(_filename, 218, fn, "call", 1, null, false, [thisObj, true, elt, i, this])) result.push(elt);
								}
						}
					} else {
						_streamline.await(_filename, 222, this, "map_", 0, null, false, [true, par, _streamline.async(function _$$$$3(_7, elt, i, arr) {
							{
								if (_streamline.await(_filename, 223, fn, "call", 1, null, false, [thisObj, true, elt, i, arr])) result.push(elt);
							}
						}, 0, 4), thisObj]);
					}
				return result;
			}
		}, 0, 4)
	});
	/// * `bool = array.every_(_[, options], fn[, thisObj])`  
	///   `fn` is called as `fn(_, elt, i, array)`.
	delete Array.prototype.every_;
	Object.defineProperty(Array.prototype, 'every_', {
		configurable: true,
		writable: true,
		enumerable: false,
		value: _streamline.async(function _$$value$$4(_8, options, fn, thisObj) {
			{
				if (typeof options === "function") {
						thisObj = fn;
						fn = options;
						options = 1;
					}
				var par = _parallel(options);
				thisObj = thisObj !== undefined ? thisObj : this;
				var len = this.length,
				    i;
				if (par === 1 || len <= 1) {
						for (i = 0; i < len; i++) {

							if (has.call(this, i) && !_streamline.await(_filename, 248, fn, "call", 1, null, false, [thisObj, true, this[i], i, this])) return false;
						}
					} else {
						var fun = funnel(par);
						var futures = this.map(function (elt, i, arr) {
							return _streamline.future(_filename, 253, null, fun, 0, null, false, [false, _streamline.async(function _$$$$4(_9) {
								{
									return _streamline.await(_filename, 254, fn, "call", 1, null, false, [thisObj, true, elt, i, arr]);
								}
							}, 0, 1)]);
						});
						for (i = 0; i < len; i++) {
							if (has.call(this, i) && !_streamline.await(_filename, 258, futures, i, 0, null, false, [true])) {
									fun.close();
									return false;
								}
						}
					}
				return true;
			}
		}, 0, 4)
	});
	/// * `bool = array.some_(_[, options], fn[, thisObj])`  
	///   `fn` is called as `fn(_, elt, i, array)`.
	delete Array.prototype.some_;
	Object.defineProperty(Array.prototype, 'some_', {
		configurable: true,
		writable: true,
		enumerable: false,
		value: _streamline.async(function _$$value$$5(_10, options, fn, thisObj) {
			{
				if (typeof options === "function") {
						thisObj = fn;
						fn = options;
						options = 1;
					}
				var par = _parallel(options);
				thisObj = thisObj !== undefined ? thisObj : this;
				var len = this.length,
				    i;
				if (par === 1 || len <= 1) {
						for (i = 0; i < len; i++) {
							if (has.call(this, i) && _streamline.await(_filename, 285, fn, "call", 1, null, false, [thisObj, true, this[i], i, this])) return true;
						}
					} else {
						var fun = funnel(par);
						var futures = this.map(function (elt, i, arr) {
							return _streamline.future(_filename, 290, null, fun, 0, null, false, [false, _streamline.async(function _$$$$5(_11) {
								{
									return _streamline.await(_filename, 291, fn, "call", 1, null, false, [thisObj, true, elt, i, arr]);
								}
							}, 0, 1)]);
						});
						for (i = 0; i < len; i++) {
							if (has.call(this, i) && _streamline.await(_filename, 295, futures, i, 0, null, false, [true])) {
									fun.close();
									return true;
								}
						}
					}
				return false;
			}
		}, 0, 4)
	});
	/// * `result = array.reduce_(_, fn, val[, thisObj])`  
	///   `fn` is called as `val = fn(_, val, elt, i, array)`.
	delete Array.prototype.reduce_;
	Object.defineProperty(Array.prototype, 'reduce_', {
		configurable: true,
		writable: true,
		enumerable: false,
		value: _streamline.async(function _$$value$$6(_12, fn, v, thisObj) {
			{
				thisObj = thisObj !== undefined ? thisObj : this;
				var len = this.length;
				for (var i = 0; i < len; i++) {
					if (has.call(this, i)) v = _streamline.await(_filename, 315, fn, "call", 1, null, false, [thisObj, true, v, this[i], i, this]);
				}
				return v;
			}
		}, 0, 4)
	});
	/// * `result = array.reduceRight_(_, fn, val[, thisObj])`  
	///   `fn` is called as `val = fn(_, val, elt, i, array)`.
	delete Array.prototype.reduceRight_;
	Object.defineProperty(Array.prototype, 'reduceRight_', {
		configurable: true,
		writable: true,
		enumerable: false,
		value: _streamline.async(function _$$value$$7(_13, fn, v, thisObj) {
			{
				thisObj = thisObj !== undefined ? thisObj : this;
				var len = this.length;
				for (var i = len - 1; i >= 0; i--) {
					if (has.call(this, i)) v = _streamline.await(_filename, 331, fn, "call", 1, null, false, [thisObj, true, v, this[i], i, this]);
				}
				return v;
			}
		}, 0, 4)
	});

	/// * `array = array.sort_(_, compare [, beg [, end]])`  
	///   `compare` is called as `cmp = compare(_, elt1, elt2)`.  
	///   Note: this function _changes_ the original array (and returns it).
	delete Array.prototype.sort_;
	Object.defineProperty(Array.prototype, 'sort_', {
		configurable: true,
		writable: true,
		enumerable: false,
		value: _streamline.async(function _$$value$$8(_14, compare, beg, end) {
			{
				var _qsort = _streamline.async(function _$$_qsort$$(_15, beg, end) {
					{
						if (beg >= end) return;

						var tmp;
						if (end === beg + 1) {
								if (_streamline.await(_filename, 355, null, compare, 0, null, false, [true, array[beg], array[end]]) > 0) {
										tmp = array[beg];
										array[beg] = array[end];
										array[end] = tmp;
									}
								return;
							}

						var mid = Math.floor((beg + end) / 2);
						var o = array[mid];
						var nbeg = beg;
						var nend = end;

						while (nbeg <= nend) {
							while (nbeg < end && _streamline.await(_filename, 369, null, compare, 0, null, false, [true, array[nbeg], o]) < 0) {
								nbeg++;
							}while (beg < nend && _streamline.await(_filename, 370, null, compare, 0, null, false, [true, o, array[nend]]) < 0) {
								nend--;
							}if (nbeg <= nend) {
									tmp = array[nbeg];
									array[nbeg] = array[nend];
									array[nend] = tmp;
									nbeg++;
									nend--;
								}
						}

						if (nbeg < end) _qsort["fiberized-0"](true, nbeg, end);
						if (beg < nend) _qsort["fiberized-0"](true, beg, nend);
					}
				}, 0, 3);

				var array = this;
				beg = beg || 0;
				end = end == null ? array.length - 1 : end;

				_qsort["fiberized-0"](true, beg, end);
				return array;
			}
		}, 0, 4)
	});

	/// 
	/// ## Function functions  
	/// 
	/// * `result = fn.apply_(_, thisObj, args[, index])`  
	///   Helper to use `Function.prototype.apply` inside streamlined functions.  
	///   Equivalent to `result = fn.apply(thisObj, argsWith_)` where `argsWith_` is 
	///   a modified `args` in which the callback has been inserted at `index` 
	///   (at the end of the argument list if `index` is omitted or negative).
	delete Function.prototype.apply_;
	Object.defineProperty(Function.prototype, 'apply_', {
		configurable: true,
		writable: true,
		enumerable: false,
		value: function value(callback, thisObj, args, index) {
			args = Array.prototype.slice.call(args, 0);
			args.splice(index != null && index >= 0 ? index : args.length, 0, callback);
			return this.apply(thisObj, args);
		}
	});
})(typeof exports !== 'undefined' ? exports : Streamline.builtins = Streamline.builtins || {});