var regeneratorRuntime = typeof require === "function" ? require("regenerator/runtime") : Streamline.require("regenerator/runtime");

var _streamline = typeof require === "function" ? require("streamline-runtime/lib/callbacks/runtime") : Streamline.require("streamline-runtime/lib/callbacks/runtime");

var _filename = "flows-source._js";
/**
 * Copyright (c) 2011 Bruno Jouhier <bruno.jouhier@sage.com>
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 *
 */
/// !doc
///
/// # Control Flow utilities
/// 
/// `var flows = require('streamline-runtime').flows`

(function (exports) {
	"use strict";
	var globals = require('../util').getGlobals();
	/// !nodoc
	/// Obsolete API
	///
	/// This API is obsolete. Use `array.forEach_`, `array.map_`, ... instead.
	///
	/// * `flows.each(_, array, fn, [thisObj])` 
	///   applies `fn` sequentially to the elements of `array`. 
	///   `fn` is called as `fn(_, elt, i)`.
	exports.each = _streamline.async(regeneratorRuntime.mark(function _$$$$(_, array, fn, thisObj) {
		return regeneratorRuntime.wrap(function _$$$$$(context$2$0) {
			while (1) switch (context$2$0.prev = context$2$0.next) {
				case 0:
					if (!(array && array.length)) {
						context$2$0.next = 6;
						break;
					}

					context$2$0.next = 3;
					return _streamline.await(_filename, 44, array, "forEach_", 0, null, false)(true, fn, thisObj);

				case 3:
					context$2$0.t0 = context$2$0.sent;
					context$2$0.next = 7;
					break;

				case 6:
					context$2$0.t0 = undefined;

				case 7:
					return context$2$0.abrupt("return", context$2$0.t0);

				case 8:
				case "end":
					return context$2$0.stop();
			}
		}, _$$$$, this);
	}), 0, 4);
	/// * `result = flows.map(_, array, fn, [thisObj])` 
	///   transforms `array` by applying `fn` to each element in turn. 
	///   `fn` is called as `fn(_, elt, i)`.
	exports.map = _streamline.async(regeneratorRuntime.mark(function _$$$$2(_, array, fn, thisObj) {
		return regeneratorRuntime.wrap(function _$$$$2$(context$2$0) {
			while (1) switch (context$2$0.prev = context$2$0.next) {
				case 0:
					if (!array) {
						context$2$0.next = 6;
						break;
					}

					context$2$0.next = 3;
					return _streamline.await(_filename, 50, array, "map_", 0, null, false)(true, fn, thisObj);

				case 3:
					context$2$0.t0 = context$2$0.sent;
					context$2$0.next = 7;
					break;

				case 6:
					context$2$0.t0 = array;

				case 7:
					return context$2$0.abrupt("return", context$2$0.t0);

				case 8:
				case "end":
					return context$2$0.stop();
			}
		}, _$$$$2, this);
	}), 0, 4);
	/// * `result = flows.filter(_, array, fn, [thisObj])` 
	///   generates a new array that only contains the elements that satisfy the `fn` predicate. 
	///   `fn` is called as `fn(_, elt)`.
	exports.filter = _streamline.async(regeneratorRuntime.mark(function _$$$$3(_, array, fn, thisObj) {
		return regeneratorRuntime.wrap(function _$$$$3$(context$2$0) {
			while (1) switch (context$2$0.prev = context$2$0.next) {
				case 0:
					if (!array) {
						context$2$0.next = 6;
						break;
					}

					context$2$0.next = 3;
					return _streamline.await(_filename, 56, array, "filter_", 0, null, false)(true, fn, thisObj);

				case 3:
					context$2$0.t0 = context$2$0.sent;
					context$2$0.next = 7;
					break;

				case 6:
					context$2$0.t0 = array;

				case 7:
					return context$2$0.abrupt("return", context$2$0.t0);

				case 8:
				case "end":
					return context$2$0.stop();
			}
		}, _$$$$3, this);
	}), 0, 4);
	/// * `bool = flows.every(_, array, fn, [thisObj])` 
	///   returns true if `fn` is true on every element (if `array` is empty too). 
	///   `fn` is called as `fn(_, elt)`.
	exports.every = _streamline.async(regeneratorRuntime.mark(function _$$$$4(_, array, fn, thisObj) {
		return regeneratorRuntime.wrap(function _$$$$4$(context$2$0) {
			while (1) switch (context$2$0.prev = context$2$0.next) {
				case 0:
					if (!array) {
						context$2$0.next = 6;
						break;
					}

					context$2$0.next = 3;
					return _streamline.await(_filename, 62, array, "every_", 0, null, false)(true, fn, thisObj);

				case 3:
					context$2$0.t0 = context$2$0.sent;
					context$2$0.next = 7;
					break;

				case 6:
					context$2$0.t0 = undefined;

				case 7:
					return context$2$0.abrupt("return", context$2$0.t0);

				case 8:
				case "end":
					return context$2$0.stop();
			}
		}, _$$$$4, this);
	}), 0, 4);
	/// * `bool = flows.some(_, array, fn, [thisObj])` 
	///   returns true if `fn` is true for at least one element. 
	///   `fn` is called as `fn(_, elt)`.
	exports.some = _streamline.async(regeneratorRuntime.mark(function _$$$$5(_, array, fn, thisObj) {
		return regeneratorRuntime.wrap(function _$$$$5$(context$2$0) {
			while (1) switch (context$2$0.prev = context$2$0.next) {
				case 0:
					if (!array) {
						context$2$0.next = 6;
						break;
					}

					context$2$0.next = 3;
					return _streamline.await(_filename, 68, array, "some_", 0, null, false)(true, fn, thisObj);

				case 3:
					context$2$0.t0 = context$2$0.sent;
					context$2$0.next = 7;
					break;

				case 6:
					context$2$0.t0 = undefined;

				case 7:
					return context$2$0.abrupt("return", context$2$0.t0);

				case 8:
				case "end":
					return context$2$0.stop();
			}
		}, _$$$$5, this);
	}), 0, 4);
	/// * `result = flows.reduce(_, array, fn, val, [thisObj])` 
	///   reduces by applying `fn` to each element. 
	///   `fn` is called as `val = fn(_, val, elt, i, array)`.
	exports.reduce = _streamline.async(regeneratorRuntime.mark(function _$$$$6(_, array, fn, v, thisObj) {
		return regeneratorRuntime.wrap(function _$$$$6$(context$2$0) {
			while (1) switch (context$2$0.prev = context$2$0.next) {
				case 0:
					if (!array) {
						context$2$0.next = 6;
						break;
					}

					context$2$0.next = 3;
					return _streamline.await(_filename, 74, array, "reduce_", 0, null, false)(true, fn, v, thisObj);

				case 3:
					context$2$0.t0 = context$2$0.sent;
					context$2$0.next = 7;
					break;

				case 6:
					context$2$0.t0 = v;

				case 7:
					return context$2$0.abrupt("return", context$2$0.t0);

				case 8:
				case "end":
					return context$2$0.stop();
			}
		}, _$$$$6, this);
	}), 0, 5);
	/// * `result = flows.reduceRight(_, array, fn, val, [thisObj])` 
	///   reduces from end to start by applying `fn` to each element. 
	///   `fn` is called as `val = fn(_, val, elt, i, array)`.
	exports.reduceRight = _streamline.async(regeneratorRuntime.mark(function _$$$$7(_, array, fn, v, thisObj) {
		return regeneratorRuntime.wrap(function _$$$$7$(context$2$0) {
			while (1) switch (context$2$0.prev = context$2$0.next) {
				case 0:
					if (!array) {
						context$2$0.next = 6;
						break;
					}

					context$2$0.next = 3;
					return _streamline.await(_filename, 80, array, "reduceRight_", 0, null, false)(true, fn, v, thisObj);

				case 3:
					context$2$0.t0 = context$2$0.sent;
					context$2$0.next = 7;
					break;

				case 6:
					context$2$0.t0 = v;

				case 7:
					return context$2$0.abrupt("return", context$2$0.t0);

				case 8:
				case "end":
					return context$2$0.stop();
			}
		}, _$$$$7, this);
	}), 0, 5);

	/// * `array = flows.sort(_, array, compare, [beg], [end])` 
	///   sorts the array. 
	///   `compare` is called as `cmp = compare(_, elt1, elt2)`
	///  
	///   Note: this function _changes_ the original array (and returns it)
	exports.sort = _streamline.async(regeneratorRuntime.mark(function _$$$$8(_, array, compare, beg, end) {
		return regeneratorRuntime.wrap(function _$$$$8$(context$2$0) {
			while (1) switch (context$2$0.prev = context$2$0.next) {
				case 0:
					if (!array) {
						context$2$0.next = 6;
						break;
					}

					context$2$0.next = 3;
					return _streamline.await(_filename, 89, array, "sort_", 0, null, false)(true, compare, beg, end);

				case 3:
					context$2$0.t0 = context$2$0.sent;
					context$2$0.next = 7;
					break;

				case 6:
					context$2$0.t0 = array;

				case 7:
					return context$2$0.abrupt("return", context$2$0.t0);

				case 8:
				case "end":
					return context$2$0.stop();
			}
		}, _$$$$8, this);
	}), 0, 5);
	///
	/// ## Object utility (obsolete)
	///
	/// This API is obsolete. Use `Object.keys(obj).forEach_` instead.
	///
	/// * `flows.eachKey(_, obj, fn)` 
	///   calls `fn(_, key, obj[key])` for every `key` in `obj`.
	exports.eachKey = _streamline.async(regeneratorRuntime.mark(function _$$$$9(_, obj, fn, thisObj) {
		return regeneratorRuntime.wrap(function _$$$$9$(context$2$0) {
			while (1) switch (context$2$0.prev = context$2$0.next) {
				case 0:
					context$2$0.next = 2;
					return _streamline.await(_filename, 99, obj ? Object.keys(obj) : [], "forEach_", 0, null, false)(true, _streamline.async(regeneratorRuntime.mark(function _$$$$10(_, elt) {
						return regeneratorRuntime.wrap(function _$$$$10$(context$3$0) {
							while (1) switch (context$3$0.prev = context$3$0.next) {
								case 0:
									context$3$0.next = 2;
									return _streamline.await(_filename, 100, fn, "call", 1, null, false)(thisObj, true, elt, obj[elt]);

								case 2:
								case "end":
									return context$3$0.stop();
							}
						}, _$$$$10, this);
					}), 0, 2));

				case 2:
					return context$2$0.abrupt("return", context$2$0.sent);

				case 3:
				case "end":
					return context$2$0.stop();
			}
		}, _$$$$9, this);
	}), 0, 4);

	// deprecated -- don't document
	exports.spray = function (fns, max) {
		return new function () {
			var funnel = exports.funnel(max);
			this.collect = _streamline.async(regeneratorRuntime.mark(function _$$$$11(_, count, trim) {
				return regeneratorRuntime.wrap(function _$$$$11$(context$4$0) {
					while (1) switch (context$4$0.prev = context$4$0.next) {
						case 0:
							context$4$0.next = 2;
							return _streamline.await(_filename, 109, function (callback) {
								if (typeof callback !== "function") throw new Error("invalid call to collect: no callback");
								var results = trim ? [] : new Array(fns.length);
								count = count < 0 ? fns.length : Math.min(count, fns.length);
								if (count === 0) return callback(null, results);
								var collected = 0;
								for (var i = 0; i < fns.length; i++) {
									(function (i) {
										funnel(function (err, result) {
											if (err) return callback(err);
											if (trim) results.push(result);else results[i] = result;
											if (++collected === count) return callback(null, results);
										}, fns[i]);
									})(i);
								}
							}, "call", 1, null, false)(this, true);

						case 2:
							return context$4$0.abrupt("return", context$4$0.sent);

						case 3:
						case "end":
							return context$4$0.stop();
					}
				}, _$$$$11, this);
			}), 0, 3);
			this.collectOne = _streamline.async(regeneratorRuntime.mark(function _$$$$12(_) {
				var result;
				return regeneratorRuntime.wrap(function _$$$$12$(context$4$0) {
					while (1) switch (context$4$0.prev = context$4$0.next) {
						case 0:
							context$4$0.next = 2;
							return _streamline.await(_filename, 128, this, "collect", 0, null, false)(true, 1, true);

						case 2:
							result = context$4$0.sent;
							return context$4$0.abrupt("return", result && result[0]);

						case 4:
						case "end":
							return context$4$0.stop();
					}
				}, _$$$$12, this);
			}), 0, 1);
			this.collectAll = _streamline.async(regeneratorRuntime.mark(function _$$$$13(_) {
				return regeneratorRuntime.wrap(function _$$$$13$(context$4$0) {
					while (1) switch (context$4$0.prev = context$4$0.next) {
						case 0:
							context$4$0.next = 2;
							return _streamline.await(_filename, 132, this, "collect", 0, null, false)(true, -1, false);

						case 2:
							return context$4$0.abrupt("return", context$4$0.sent);

						case 3:
						case "end":
							return context$4$0.stop();
					}
				}, _$$$$13, this);
			}), 0, 1);
		}();
	};

	/// !doc
	/// ## funnel
	/// * `fun = flows.funnel(max)` 
	///   limits the number of concurrent executions of a given code block.
	///
	/// The `funnel` function is typically used with the following pattern:
	///
	/// ``` javascript
	/// // somewhere
	/// var myFunnel = flows.funnel(10); // create a funnel that only allows 10 concurrent executions.
	///
	/// // elsewhere
	/// myFunnel(_, function(_) { /* code with at most 10 concurrent executions */ });
	/// ```
	///
	/// The `diskUsage2.js` example demonstrates how these calls can be combined to control concurrent execution.
	///
	/// The `funnel` function can also be used to implement critical sections. Just set funnel's `max` parameter to 1.
	///
	/// If `max` is set to 0, a default number of parallel executions is allowed.
	/// This default number can be read and set via `flows.funnel.defaultSize`. 
	/// If `max` is negative, the funnel does not limit the level of parallelism.
	///
	/// The funnel can be closed with `fun.close()`. 
	/// When a funnel is closed, the operations that are still in the funnel will continue but their callbacks
	/// won't be called, and no other operation will enter the funnel.
	exports.funnel = require('streamline-runtime/lib/funnel');

	/// ## handshake and queue
	/// * `hs = flows.handshake()` 
	///   allocates a simple semaphore that can be used to do simple handshakes between two tasks. 
	///   The returned handshake object has two methods: 
	///   `hs.wait(_)`: waits until `hs` is notified. 
	///   `hs.notify()`: notifies `hs`. 
	///   Note: `wait` calls are not queued. An exception is thrown if wait is called while another `wait` is pending.
	exports.handshake = function () {
		var callback = null,
		    notified = false;
		return {
			wait: function (cb) {
				if (callback) throw new Error("already waiting");
				if (notified) exports.setImmediate(cb);else callback = cb;
				notified = false;
			},
			notify: function () {
				if (!callback) notified = true;else exports.setImmediate(callback);
				callback = null;
			}
		};
	};

	/// * `q = flows.queue(options)` 
	///   allocates a queue which may be used to send data asynchronously between two tasks. 
	///   The `max` option can be set to control the maximum queue length. 
	///   When `max` has been reached `q.put(data)` discards data and returns false.
	///   The returned queue has the following methods: 
	exports.queue = function (options) {
		if (typeof options === 'number') options = {
			max: options
		};
		options = options || {};
		var max = options.max != null ? options.max : -1;
		var callback = null,
		    err = null,
		    q = [],
		    pendingWrites = [];
		var queue = {
			///   `data = q.read(_)`: dequeues an item from the queue. Waits if no element is available. 
			read: function (cb) {
				if (callback) throw new Error("already getting");
				if (q.length > 0) {
						var item = q.shift();
						// recycle queue when empty to avoid maintaining arrays that have grown large and shrunk
						if (q.length === 0) q = [];
						exports.setImmediate(function () {
							cb(err, item);
						});
						if (pendingWrites.length > 0) {
								var wr = pendingWrites.shift();
								exports.setImmediate(function () {
									wr[0](err, wr[1]);
								});
							}
					} else {
						callback = cb;
					}
			},
			///   `q.write(_, data)`:  queues an item. Waits if the queue is full. 
			write: function (cb, item) {
				if (this.put(item)) {
						exports.setImmediate(function () {
							cb(err);
						});
					} else {
						pendingWrites.push([cb, item]);
					}
			},
			///   `ok = q.put(data)`: queues an item synchronously. Returns true if the queue accepted it, false otherwise.
			put: function (item, force) {
				if (!callback) {
						if (max >= 0 && q.length >= max && !force) return false;
						q.push(item);
					} else {
						var cb = callback;
						callback = null;
						exports.setImmediate(function () {
							cb(err, item);
						});
					}
				return true;
			},
			///   `q.end()`: ends the queue. This is the synchronous equivalent of `q.write(_, undefined)` 
			end: function () {
				this.put(undefined, true);
			},
			///   `data = q.peek()`: returns the first item, without dequeuing it. Returns `undefined` if the queue is empty. 
			peek: function () {
				return q[0];
			},
			///   `array = q.contents()`: returns a copy of the queue's contents. 
			contents: function () {
				return q.slice(0);
			},
			///   `q.adjust(fn[, thisObj])`: adjusts the contents of the queue by calling `newContents = fn(oldContents)`. 
			adjust: function (fn, thisObj) {
				var nq = fn.call(thisObj, q);
				if (!Array.isArray(nq)) throw new Error("reorder function does not return array");
				q = nq;
			}
		};
		///   `q.length`: number of items currently in the queue. 
		Object.defineProperty(queue, "length", {
			get: function () {
				return q.length;
			}
		});
		return queue;
	};

	///
	/// ## Miscellaneous utilities
	/// * `results = flows.collect(_, futures)` 
	///   collects the results of an array of futures
	exports.collect = _streamline.async(regeneratorRuntime.mark(function _$$$$14(_, futures) {
		return regeneratorRuntime.wrap(function _$$$$14$(context$2$0) {
			while (1) switch (context$2$0.prev = context$2$0.next) {
				case 0:
					context$2$0.t0 = futures;

					if (!context$2$0.t0) {
						context$2$0.next = 5;
						break;
					}

					context$2$0.next = 4;
					return _streamline.await(_filename, 279, futures, "map_", 0, null, false)(true, _streamline.async(regeneratorRuntime.mark(function _$$$$15(_, future) {
						return regeneratorRuntime.wrap(function _$$$$15$(context$3$0) {
							while (1) switch (context$3$0.prev = context$3$0.next) {
								case 0:
									context$3$0.next = 2;
									return _streamline.await(_filename, 280, null, future, 0, null, false)(true);

								case 2:
									return context$3$0.abrupt("return", context$3$0.sent);

								case 3:
								case "end":
									return context$3$0.stop();
							}
						}, _$$$$15, this);
					}), 0, 2));

				case 4:
					context$2$0.t0 = context$2$0.sent;

				case 5:
					return context$2$0.abrupt("return", context$2$0.t0);

				case 6:
				case "end":
					return context$2$0.stop();
			}
		}, _$$$$14, this);
	}), 0, 2);

	// Obsolete API - use require('streamline/lib/globals').context instead
	exports.setContext = function (ctx) {
		var old = globals.context;
		globals.context = ctx;
		return old;
	};
	exports.getContext = function () {
		return globals.context;
	};

	///
	/// * `result = flows.trampoline(_, fn, thisObj)` 
	///   Executes `fn(_)` through a trampoline. 
	///   Waits for `fn`'s result and returns it. 
	///   This is equivalent to calling `fn.call(thisObj, _)` but the current stack is unwound
	///   before calling `fn`.
	exports.trampoline = function (cb, fn, thisObj) {
		exports.setImmediate(globals.withContext(function () {
			fn.call(thisObj, cb);
		}, globals.context));
	};

	///
	/// * `flows.setImmediate(fn)` 
	///   portable `setImmediate` both browser and server. 
	exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function (fn) {
		setTimeout(fn, 0);
	};

	///
	/// * `flows.nextTick(_)` 
	///   `nextTick` function for both browser and server. 
	///   Aliased to `process.nextTick` on the server side.
	var nextTick = typeof process === "object" && typeof process.nextTick === "function" ? process.nextTick : function (cb) {
		cb();
	};

	// document later
	exports.nextTick = _streamline.async(regeneratorRuntime.mark(function _$$$$16(_) {
		return regeneratorRuntime.wrap(function _$$$$16$(context$2$0) {
			while (1) switch (context$2$0.prev = context$2$0.next) {
				case 0:
					context$2$0.next = 2;
					return _streamline.await(_filename, 323, null, nextTick, 0, null, false)(true);

				case 2:
				case "end":
					return context$2$0.stop();
			}
		}, _$$$$16, this);
	}), 0, 1);

	// document later
	// should probably cap millis instead of trying to be too smart
	exports.setTimeout = function (fn, millis) {
		// node's setTimeout notifies immediately if millis > max!!
		// So be safe and work around it.
		// Gotcha: timeout cannot be cancelled beyond max.
		var max = 0x7fffffff;
		if (millis > max) {
				return setTimeout(function () {
					exports.setTimeout(fn, millis - max);
				}, max);
			} else {
				return setTimeout(function () {
					_streamline.future(_filename, 339, null, fn, 0, null, false)(false);
				}, millis);
			}
	};

	// document later
	exports.setInterval = function (fn, millis) {
		return setInterval(function () {
			_streamline.future(_filename, 347, null, fn, 0, null, false)(false);
		}, millis);
	};

	///
	/// * `flows.sleep(_, millis)` 
	///   Sleeps `millis` ms. 
	exports.sleep = _streamline.async(regeneratorRuntime.mark(function _$$$$17(_, millis) {
		return regeneratorRuntime.wrap(function _$$$$17$(context$2$0) {
			while (1) switch (context$2$0.prev = context$2$0.next) {
				case 0:
					context$2$0.next = 2;
					return _streamline.await(_filename, 355, null, setTimeout, 0, null, false)(true, millis);

				case 2:
					return context$2$0.abrupt("return", context$2$0.sent);

				case 3:
				case "end":
					return context$2$0.stop();
			}
		}, _$$$$17, this);
	}), 0, 2);

	exports.eventHandler = function (fn) {
		return function () {
			var that = this;
			var args = Array.prototype.slice(arguments, 0);
			return _streamline.async(regeneratorRuntime.mark(function _$$$$18(_) {
				return regeneratorRuntime.wrap(function _$$$$18$(context$4$0) {
					while (1) switch (context$4$0.prev = context$4$0.next) {
						case 0:
							context$4$0.next = 2;
							return _streamline.await(_filename, 363, fn, "apply_", 0, null, false)(true, that, args, 0);

						case 2:
							return context$4$0.abrupt("return", context$4$0.sent);

						case 3:
						case "end":
							return context$4$0.stop();
					}
				}, _$$$$18, this);
			}), 0, 1)(function (err) {
				if (err) throw err;
			});
		};
	};

	//   Obsolete. Use `fn.apply_` instead.
	exports.apply = _streamline.async(regeneratorRuntime.mark(function _$$apply$$(_, fn, thisObj, args, index) {
		return regeneratorRuntime.wrap(function _$$apply$$$(context$2$0) {
			while (1) switch (context$2$0.prev = context$2$0.next) {
				case 0:
					context$2$0.next = 2;
					return _streamline.await(_filename, 372, fn, "apply_", 0, null, false)(true, thisObj, args, index);

				case 2:
					return context$2$0.abrupt("return", context$2$0.sent);

				case 3:
				case "end":
					return context$2$0.stop();
			}
		}, _$$apply$$, this);
	}), 0, 5);

	///
	/// * `flows.callWithTimeout(_, fn, millis)` 
	///   Calls `fn(_)` with a timeout guard. 
	///   Throws a timeout exception if `fn` takes more than `millis` ms to complete. 
	exports.callWithTimeout = function (cb, fn, millis) {
		var tid = setTimeout(function () {
			if (cb) {
					var ex = new Error("timeout");
					ex.code = "ETIMEOUT";
					ex.errno = "ETIMEOUT";
					cb(ex);
					cb = null;
				}
		}, millis);
		fn(function (err, result) {
			if (cb) {
					clearTimeout(tid);
					cb(err, result);
					cb = null;
				}
		});
	};

	///
	/// * `fn = flows.withContext(fn, cx)` 
	///   wraps a function so that it executes with context `cx` (or a wrapper around current context if `cx` is falsy).
	///   The previous context will be restored when the function returns (or throws). 
	///   returns the wrapped function.
	exports.withContext = function (fn, cx) {
		return function () {
			var oldContext = globals.context;
			globals.context = cx || Object.create(oldContext);
			try {
				return fn.apply(this, arguments);
			} finally {
				globals.context = oldContext;
			}
		};
	};

	///
	/// * `flows.ignore` 
	///   callback that ignores errors (`function(err) {}`) 
	exports.ignore = function (err) {};

	///
	/// * `flows.check` 
	///   callback that throws errors (`function(err) { if (err) throw err; }`) 
	exports.check = function (err) {
		if (err) throw err;
	};
})(typeof exports !== 'undefined' ? exports : Streamline.flows = Streamline.flows || {});
///