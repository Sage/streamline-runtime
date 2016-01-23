"use strict";

var regeneratorRuntime = typeof require === 'function' ? require("streamline-runtime/lib/callbacks/regenerator") : Streamline.require("streamline-runtime/lib/callbacks/regenerator");

var _streamline = typeof require === 'function' ? require("streamline-runtime/lib/callbacks/runtime") : Streamline.require("streamline-runtime/lib/callbacks/runtime");

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

	var funnel = require('../funnel');

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
		value: _streamline.async(regeneratorRuntime.mark(function _$$value$$(_, options, fn, thisObj) {
			var par, len, i;
			return regeneratorRuntime.wrap(function _$$value$$$(_context) {
				while (1) {
					switch (_context.prev = _context.next) {
						case 0:
							if (typeof options === "function") {
									thisObj = fn;
									fn = options;
									options = 1;
								}
							par = _parallel(options);

							thisObj = thisObj !== undefined ? thisObj : this;
							len = this.length;

							if (!(par === 1 || len <= 1)) {
									_context.next = 15;
									break;
								}

							i = 0;

						case 6:
							if (!(i < len)) {
									_context.next = 13;
									break;
								}

							if (!has.call(this, i)) {
									_context.next = 10;
									break;
								}

							_context.next = 10;
							return _streamline.await(_filename, 95, fn, "call", 1, null, false, [thisObj, true, this[i], i, this]);

						case 10:
							i++;
							_context.next = 6;
							break;

						case 13:
							_context.next = 17;
							break;

						case 15:
							_context.next = 17;
							return _streamline.await(_filename, 98, this, "map_", 0, null, false, [true, par, fn, thisObj]);

						case 17:
							return _context.abrupt("return", this);

						case 18:
						case "end":
							return _context.stop();
					}
				}
			}, _$$value$$, this);
		}), 0, 4)
	});
	Array.prototype.forEach_.version_ = VERSION;
	/// * `result = array.map_(_[, options], fn[, thisObj])` 
	///   `fn` is called as `fn(_, elt, i, array)`.
	delete Array.prototype.map_;
	Object.defineProperty(Array.prototype, 'map_', {
		configurable: true,
		writable: true,
		enumerable: false,
		value: _streamline.async(regeneratorRuntime.mark(function _$$value$$2(_, options, fn, thisObj) {
			var par, len, result, i, fun;
			return regeneratorRuntime.wrap(function _$$value$$2$(_context3) {
				while (1) {
					switch (_context3.prev = _context3.next) {
						case 0:
							if (typeof options === "function") {
									thisObj = fn;
									fn = options;
									options = 1;
								}
							par = _parallel(options);

							thisObj = thisObj !== undefined ? thisObj : this;
							len = this.length;

							if (!(par === 1 || len <= 1)) {
									_context3.next = 17;
									break;
								}

							result = new Array(len);
							i = 0;

						case 7:
							if (!(i < len)) {
									_context3.next = 15;
									break;
								}

							if (!has.call(this, i)) {
									_context3.next = 12;
									break;
								}

							_context3.next = 11;
							return _streamline.await(_filename, 124, fn, "call", 1, null, false, [thisObj, true, this[i], i, this]);

						case 11:
							result[i] = _context3.sent;

						case 12:
							i++;
							_context3.next = 7;
							break;

						case 15:
							_context3.next = 28;
							break;

						case 17:
							fun = funnel(par);

							result = this.map(function (elt, i, arr) {
								return _streamline.future(_filename, 129, null, fun, 0, null, false, [false, _streamline.async(regeneratorRuntime.mark(function _$$$$(_) {
									return regeneratorRuntime.wrap(function _$$$$$(_context2) {
										while (1) {
											switch (_context2.prev = _context2.next) {
												case 0:
													_context2.next = 2;
													return _streamline.await(_filename, 130, fn, "call", 1, null, false, [thisObj, true, elt, i, arr]);

												case 2:
													return _context2.abrupt("return", _context2.sent);

												case 3:
												case "end":
													return _context2.stop();
											}
										}
									}, _$$$$, this);
								}), 0, 1)]);
							});
							i = 0;

						case 20:
							if (!(i < len)) {
									_context3.next = 28;
									break;
								}

							if (!has.call(this, i)) {
									_context3.next = 25;
									break;
								}

							_context3.next = 24;
							return _streamline.await(_filename, 134, result, i, 0, null, false, [true]);

						case 24:
							result[i] = _context3.sent;

						case 25:
							i++;
							_context3.next = 20;
							break;

						case 28:
							return _context3.abrupt("return", result);

						case 29:
						case "end":
							return _context3.stop();
					}
				}
			}, _$$value$$2, this);
		}), 0, 4)
	});
	/// * `result = array.filter_(_[, options], fn[, thisObj])` 
	///   `fn` is called as `fn(_, elt, i, array)`.
	delete Array.prototype.filter_;
	Object.defineProperty(Array.prototype, 'filter_', {
		configurable: true,
		writable: true,
		enumerable: false,
		value: _streamline.async(regeneratorRuntime.mark(function _$$value$$3(_, options, fn, thisObj) {
			var par, result, len, i, elt;
			return regeneratorRuntime.wrap(function _$$value$$3$(_context5) {
				while (1) {
					switch (_context5.prev = _context5.next) {
						case 0:
							if (typeof options === "function") {
									thisObj = fn;
									fn = options;
									options = 1;
								}
							par = _parallel(options);

							thisObj = thisObj !== undefined ? thisObj : this;
							result = [];
							len = this.length;

							if (!(par === 1 || len <= 1)) {
									_context5.next = 19;
									break;
								}

							i = 0;

						case 7:
							if (!(i < len)) {
									_context5.next = 17;
									break;
								}

							if (!has.call(this, i)) {
									_context5.next = 14;
									break;
								}

							elt = this[i];
							_context5.next = 12;
							return _streamline.await(_filename, 161, fn, "call", 1, null, false, [thisObj, true, elt, i, this]);

						case 12:
							if (!_context5.sent) {
									_context5.next = 14;
									break;
								}

							result.push(elt);

						case 14:
							i++;
							_context5.next = 7;
							break;

						case 17:
							_context5.next = 21;
							break;

						case 19:
							_context5.next = 21;
							return _streamline.await(_filename, 165, this, "map_", 0, null, false, [true, par, _streamline.async(regeneratorRuntime.mark(function _$$$$2(_, elt, i, arr) {
								return regeneratorRuntime.wrap(function _$$$$2$(_context4) {
									while (1) {
										switch (_context4.prev = _context4.next) {
											case 0:
												_context4.next = 2;
												return _streamline.await(_filename, 166, fn, "call", 1, null, false, [thisObj, true, elt, i, arr]);

											case 2:
												if (!_context4.sent) {
														_context4.next = 4;
														break;
													}

												result.push(elt);

											case 4:
											case "end":
												return _context4.stop();
										}
									}
								}, _$$$$2, this);
							}), 0, 4), thisObj]);

						case 21:
							return _context5.abrupt("return", result);

						case 22:
						case "end":
							return _context5.stop();
					}
				}
			}, _$$value$$3, this);
		}), 0, 4)
	});
	/// * `bool = array.every_(_[, options], fn[, thisObj])` 
	///   `fn` is called as `fn(_, elt, i, array)`.
	delete Array.prototype.every_;
	Object.defineProperty(Array.prototype, 'every_', {
		configurable: true,
		writable: true,
		enumerable: false,
		value: _streamline.async(regeneratorRuntime.mark(function _$$value$$4(_, options, fn, thisObj) {
			var par, len, i, fun, futures;
			return regeneratorRuntime.wrap(function _$$value$$4$(_context7) {
				while (1) {
					switch (_context7.prev = _context7.next) {
						case 0:
							if (typeof options === "function") {
									thisObj = fn;
									fn = options;
									options = 1;
								}
							par = _parallel(options);

							thisObj = thisObj !== undefined ? thisObj : this;
							len = this.length;

							if (!(par === 1 || len <= 1)) {
									_context7.next = 19;
									break;
								}

							i = 0;

						case 6:
							if (!(i < len)) {
									_context7.next = 17;
									break;
								}

							_context7.t0 = has.call(this, i);

							if (!_context7.t0) {
									_context7.next = 12;
									break;
								}

							_context7.next = 11;
							return _streamline.await(_filename, 191, fn, "call", 1, null, false, [thisObj, true, this[i], i, this]);

						case 11:
							_context7.t0 = !_context7.sent;

						case 12:
							if (!_context7.t0) {
									_context7.next = 14;
									break;
								}

							return _context7.abrupt("return", false);

						case 14:
							i++;
							_context7.next = 6;
							break;

						case 17:
							_context7.next = 34;
							break;

						case 19:
							fun = funnel(par);
							futures = this.map(function (elt, i, arr) {
								return _streamline.future(_filename, 196, null, fun, 0, null, false, [false, _streamline.async(regeneratorRuntime.mark(function _$$$$3(_) {
									return regeneratorRuntime.wrap(function _$$$$3$(_context6) {
										while (1) {
											switch (_context6.prev = _context6.next) {
												case 0:
													_context6.next = 2;
													return _streamline.await(_filename, 197, fn, "call", 1, null, false, [thisObj, true, elt, i, arr]);

												case 2:
													return _context6.abrupt("return", _context6.sent);

												case 3:
												case "end":
													return _context6.stop();
											}
										}
									}, _$$$$3, this);
								}), 0, 1)]);
							});
							i = 0;

						case 22:
							if (!(i < len)) {
									_context7.next = 34;
									break;
								}

							_context7.t1 = has.call(this, i);

							if (!_context7.t1) {
									_context7.next = 28;
									break;
								}

							_context7.next = 27;
							return _streamline.await(_filename, 201, futures, i, 0, null, false, [true]);

						case 27:
							_context7.t1 = !_context7.sent;

						case 28:
							if (!_context7.t1) {
									_context7.next = 31;
									break;
								}

							fun.close();
							return _context7.abrupt("return", false);

						case 31:
							i++;
							_context7.next = 22;
							break;

						case 34:
							return _context7.abrupt("return", true);

						case 35:
						case "end":
							return _context7.stop();
					}
				}
			}, _$$value$$4, this);
		}), 0, 4)
	});
	/// * `bool = array.some_(_[, options], fn[, thisObj])` 
	///   `fn` is called as `fn(_, elt, i, array)`.
	delete Array.prototype.some_;
	Object.defineProperty(Array.prototype, 'some_', {
		configurable: true,
		writable: true,
		enumerable: false,
		value: _streamline.async(regeneratorRuntime.mark(function _$$value$$5(_, options, fn, thisObj) {
			var par, len, i, fun, futures;
			return regeneratorRuntime.wrap(function _$$value$$5$(_context9) {
				while (1) {
					switch (_context9.prev = _context9.next) {
						case 0:
							if (typeof options === "function") {
									thisObj = fn;
									fn = options;
									options = 1;
								}
							par = _parallel(options);

							thisObj = thisObj !== undefined ? thisObj : this;
							len = this.length;

							if (!(par === 1 || len <= 1)) {
									_context9.next = 19;
									break;
								}

							i = 0;

						case 6:
							if (!(i < len)) {
									_context9.next = 17;
									break;
								}

							_context9.t0 = has.call(this, i);

							if (!_context9.t0) {
									_context9.next = 12;
									break;
								}

							_context9.next = 11;
							return _streamline.await(_filename, 228, fn, "call", 1, null, false, [thisObj, true, this[i], i, this]);

						case 11:
							_context9.t0 = _context9.sent;

						case 12:
							if (!_context9.t0) {
									_context9.next = 14;
									break;
								}

							return _context9.abrupt("return", true);

						case 14:
							i++;
							_context9.next = 6;
							break;

						case 17:
							_context9.next = 34;
							break;

						case 19:
							fun = funnel(par);
							futures = this.map(function (elt, i, arr) {
								return _streamline.future(_filename, 233, null, fun, 0, null, false, [false, _streamline.async(regeneratorRuntime.mark(function _$$$$4(_) {
									return regeneratorRuntime.wrap(function _$$$$4$(_context8) {
										while (1) {
											switch (_context8.prev = _context8.next) {
												case 0:
													_context8.next = 2;
													return _streamline.await(_filename, 234, fn, "call", 1, null, false, [thisObj, true, elt, i, arr]);

												case 2:
													return _context8.abrupt("return", _context8.sent);

												case 3:
												case "end":
													return _context8.stop();
											}
										}
									}, _$$$$4, this);
								}), 0, 1)]);
							});
							i = 0;

						case 22:
							if (!(i < len)) {
									_context9.next = 34;
									break;
								}

							_context9.t1 = has.call(this, i);

							if (!_context9.t1) {
									_context9.next = 28;
									break;
								}

							_context9.next = 27;
							return _streamline.await(_filename, 238, futures, i, 0, null, false, [true]);

						case 27:
							_context9.t1 = _context9.sent;

						case 28:
							if (!_context9.t1) {
									_context9.next = 31;
									break;
								}

							fun.close();
							return _context9.abrupt("return", true);

						case 31:
							i++;
							_context9.next = 22;
							break;

						case 34:
							return _context9.abrupt("return", false);

						case 35:
						case "end":
							return _context9.stop();
					}
				}
			}, _$$value$$5, this);
		}), 0, 4)
	});
	/// * `result = array.reduce_(_, fn, val[, thisObj])` 
	///   `fn` is called as `val = fn(_, val, elt, i, array)`.
	delete Array.prototype.reduce_;
	Object.defineProperty(Array.prototype, 'reduce_', {
		configurable: true,
		writable: true,
		enumerable: false,
		value: _streamline.async(regeneratorRuntime.mark(function _$$value$$6(_, fn, v, thisObj) {
			var len, i;
			return regeneratorRuntime.wrap(function _$$value$$6$(_context10) {
				while (1) {
					switch (_context10.prev = _context10.next) {
						case 0:
							thisObj = thisObj !== undefined ? thisObj : this;
							len = this.length;
							i = 0;

						case 3:
							if (!(i < len)) {
									_context10.next = 11;
									break;
								}

							if (!has.call(this, i)) {
									_context10.next = 8;
									break;
								}

							_context10.next = 7;
							return _streamline.await(_filename, 258, fn, "call", 1, null, false, [thisObj, true, v, this[i], i, this]);

						case 7:
							v = _context10.sent;

						case 8:
							i++;
							_context10.next = 3;
							break;

						case 11:
							return _context10.abrupt("return", v);

						case 12:
						case "end":
							return _context10.stop();
					}
				}
			}, _$$value$$6, this);
		}), 0, 4)
	});
	/// * `result = array.reduceRight_(_, fn, val[, thisObj])` 
	///   `fn` is called as `val = fn(_, val, elt, i, array)`.
	delete Array.prototype.reduceRight_;
	Object.defineProperty(Array.prototype, 'reduceRight_', {
		configurable: true,
		writable: true,
		enumerable: false,
		value: _streamline.async(regeneratorRuntime.mark(function _$$value$$7(_, fn, v, thisObj) {
			var len, i;
			return regeneratorRuntime.wrap(function _$$value$$7$(_context11) {
				while (1) {
					switch (_context11.prev = _context11.next) {
						case 0:
							thisObj = thisObj !== undefined ? thisObj : this;
							len = this.length;
							i = len - 1;

						case 3:
							if (!(i >= 0)) {
									_context11.next = 11;
									break;
								}

							if (!has.call(this, i)) {
									_context11.next = 8;
									break;
								}

							_context11.next = 7;
							return _streamline.await(_filename, 274, fn, "call", 1, null, false, [thisObj, true, v, this[i], i, this]);

						case 7:
							v = _context11.sent;

						case 8:
							i--;
							_context11.next = 3;
							break;

						case 11:
							return _context11.abrupt("return", v);

						case 12:
						case "end":
							return _context11.stop();
					}
				}
			}, _$$value$$7, this);
		}), 0, 4)
	});

	/// * `array = array.sort_(_, compare [, beg [, end]])` 
	///   `compare` is called as `cmp = compare(_, elt1, elt2)`. 
	///   Note: this function _changes_ the original array (and returns it).
	delete Array.prototype.sort_;
	Object.defineProperty(Array.prototype, 'sort_', {
		configurable: true,
		writable: true,
		enumerable: false,
		value: _streamline.async(regeneratorRuntime.mark(function _$$value$$8(_, compare, beg, end) {
			var _qsort, array;

			return regeneratorRuntime.wrap(function _$$value$$8$(_context13) {
				while (1) {
					switch (_context13.prev = _context13.next) {
						case 0:
							_qsort = _streamline.async(regeneratorRuntime.mark(function _$$_qsort$$(_, beg, end) {
								var tmp, mid, o, nbeg, nend;
								return regeneratorRuntime.wrap(function _$$_qsort$$$(_context12) {
									while (1) {
										switch (_context12.prev = _context12.next) {
											case 0:
												if (!(beg >= end)) {
														_context12.next = 2;
														break;
													}

												return _context12.abrupt("return");

											case 2:
												if (!(end === beg + 1)) {
														_context12.next = 11;
														break;
													}

												_context12.next = 5;
												return _streamline.await(_filename, 298, null, compare, 0, null, false, [true, array[beg], array[end]]);

											case 5:
												_context12.t0 = _context12.sent;

												if (!(_context12.t0 > 0)) {
														_context12.next = 10;
														break;
													}

												tmp = array[beg];
												array[beg] = array[end];
												array[end] = tmp;

											case 10:
												return _context12.abrupt("return");

											case 11:
												mid = Math.floor((beg + end) / 2);
												o = array[mid];
												nbeg = beg;
												nend = end;

											case 15:
												if (!(nbeg <= nend)) {
														_context12.next = 39;
														break;
													}

											case 16:
												_context12.t1 = nbeg < end;

												if (!_context12.t1) {
														_context12.next = 22;
														break;
													}

												_context12.next = 20;
												return _streamline.await(_filename, 312, null, compare, 0, null, false, [true, array[nbeg], o]);

											case 20:
												_context12.t2 = _context12.sent;
												_context12.t1 = _context12.t2 < 0;

											case 22:
												if (!_context12.t1) {
														_context12.next = 26;
														break;
													}

												nbeg++;
												_context12.next = 16;
												break;

											case 26:
												_context12.t3 = beg < nend;

												if (!_context12.t3) {
														_context12.next = 32;
														break;
													}

												_context12.next = 30;
												return _streamline.await(_filename, 313, null, compare, 0, null, false, [true, o, array[nend]]);

											case 30:
												_context12.t4 = _context12.sent;
												_context12.t3 = _context12.t4 < 0;

											case 32:
												if (!_context12.t3) {
														_context12.next = 36;
														break;
													}

												nend--;

												_context12.next = 26;
												break;

											case 36:
												if (nbeg <= nend) {
														tmp = array[nbeg];
														array[nbeg] = array[nend];
														array[nend] = tmp;
														nbeg++;
														nend--;
													}
												_context12.next = 15;
												break;

											case 39:
												if (!(nbeg < end)) {
														_context12.next = 42;
														break;
													}

												_context12.next = 42;
												return _streamline.await(_filename, 324, null, _qsort, 0, null, false, [true, nbeg, end]);

											case 42:
												if (!(beg < nend)) {
														_context12.next = 45;
														break;
													}

												_context12.next = 45;
												return _streamline.await(_filename, 325, null, _qsort, 0, null, false, [true, beg, nend]);

											case 45:
											case "end":
												return _context12.stop();
										}
									}
								}, _$$_qsort$$, this);
							}), 0, 3);
							array = this;

							beg = beg || 0;
							end = end == null ? array.length - 1 : end;

							_context13.next = 6;
							return _streamline.await(_filename, 327, null, _qsort, 0, null, false, [true, beg, end]);

						case 6:
							return _context13.abrupt("return", array);

						case 7:
						case "end":
							return _context13.stop();
					}
				}
			}, _$$value$$8, this);
		}), 0, 4)
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