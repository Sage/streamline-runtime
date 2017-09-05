'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var regeneratorRuntime = typeof require === 'function' ? require('streamline-runtime/lib/callbacks/regenerator') : Streamline.require('streamline-runtime/lib/callbacks/regenerator');

var makeArgs = function makeArgs(i) {
	if (i <= 0) return "";
	return i > 1 ? makeArgs(i - 1) + ', a' + i : "a1";
};

var isGenerator = function isGenerator(val) {
	return val && (Object.prototype.toString.call(val) === "[object Generator]" || val.toString() === "[object Generator]");
};

var Frame = function Frame(file, line, fn) {
	this.fn = fn;
	this.file = file || "unknown";
	this.line = line || 0;
};

var pushFrame = function pushFrame(g) {
	if (glob.emitter) glob.emitter.emit('enter', g.frame);
	g.frame = g.frame || glob.frame;
	glob.frame = null;
};

var popFrame = function popFrame(g) {
	if (glob.emitter) glob.emitter.emit('exit', g.frame);
};

var run = function run(fn, g, cb, options) {
	var rsm = glob.resume;
	var emit = function emit(ev, g) {
		if (glob.emitter) glob.emitter.emit(ev, g.frame);
	};

	try {
		if (glob.frame) {
				g.frame = glob.frame;
				g.frame.g = g;
				glob.frame = null;
			} else {
				g.frame = new Frame("", 0, fn);
			}

		glob.resume = function (err, val) {
			if (glob.yielded) {
					emit("resume", g);
					glob.yielded = false;
				}
			while (g) {
				if (options && options.interrupt && options.interrupt()) return;
				try {
					// ES6 is deprecating send in favor of next. Following line makes us compatible with both.
					var send = g.send || g.next;
					var v = err ? g.throw(err) : send.call(g, val);
					val = v.value;
					err = null;
					// if we get PENDING, the current call completed with a pending I/O
					// resume will be called again when the I/O completes. So just save the context and return here.
					if (val === glob.PENDING) {
							if (!glob.yielded) {
									emit("yield", g);
									glob.yielded = true;
								}
							return;
						}
					// if we get [PENDING, e, r], the current call invoked its callback synchronously
					// we just loop to send/throw what the callback gave us.
					if (val && val[0] === glob.PENDING) {
							err = val[1];
							val = val[2];
							if (err) err = wrapError(err, g);
						}
						// else, if g is done we unwind it we send val to the parent generator (or through cb if we are at the top)
					else if (v.done) {
								//g.close();
								popFrame(g);
								g = g.prev;
							}
							// else if val is not a generator we have an error. Yield was not applied to a generators
						else {
								if (!isGenerator(val)) {
										throw new Error("invalid value was yielded. Expected a generator, got " + val);
									}
								// we got a new generator which means that g called another generator function
								// the new generator become current and we loop with g.send(undefined) (equiv to g.next()) 
								val.prev = g;
								g = val;
								pushFrame(g);
								val = undefined;
							}
				} catch (ex) {
					// the send/throw call failed.
					// we unwind the current generator and we rethrow into the parent generator (or through cb if at the top)
					//g.close();
					err = wrapError(ex, g);
					popFrame(g);
					g = g.prev;
					val = undefined;
				}
			}
			// we have exhausted the stack of generators. 
			// return the result or error through the callback.
			cb(err, val);
		};

		// start the resume loop
		glob.resume();
	} finally {
		// restore resume global
		glob.resume = rsm;
	}
};

var mapResults = function mapResults(options, args) {
	if (options && (typeof options === 'undefined' ? 'undefined' : _typeof(options)) === "object") {
			if (options.returnArray) return args;
			if (options.returnObject) return options.returnObject.reduce(function (res, key, i) {
				res[key] = args[i];
				return res;
			}, {});
		}
	return args[0];
};

var invoke = function invoke(that, fn, args, index, index2, returnArray) {
	// Set things up so that call returns:
	// * PENDING if it completes with a pending I/O (and cb will be called later)
	// * [PENDING, e, r] if the callback is called synchronously.
	var result = glob.PENDING,
	    sync = true;
	var rsm = glob.resume;

	// convert args to array so that args.length gets correctly set if index is args.length
	args = Array.prototype.slice.call(args, 0);
	var cx = glob.context;
	var callback = function callback(e, r) {
		var oldContext = glob.context;
		var oldResume = glob.resume;
		try {
			if (returnArray) r = Array.prototype.slice.call(arguments, 1);
			glob.context = cx;
			glob.resume = rsm;
			if (sync) {
					result = [glob.PENDING, e, r];
				} else {
					glob.resume(e, r);
				}
		} finally {
			glob.context = oldContext;
			glob.resume = oldResume;
		}
	};
	if (index2 != null) {
			args[index] = function (r) {
				callback(null, r);
			};
			args[index2] = function (e) {
				callback(e);
			};
		} else {
			args[index] = callback;
		}
	fn.apply(that, args);
	sync = false;
	return result;
};

var makeUnstarror = function makeUnstarror(i) {
	return eval("(function(fn, options)" + unstarBody.replace(/function\s*F\(\)/, "function F(" + makeArgs(i) + ")") + ")");
};

var unstar = function unstar(fn, index, arity) {
	var i = arity != null ? arity : index == null ? fn.length + 1 : fn.length;
	var unstarror = unstarrors[i] || (unstarrors[i] = makeUnstarror(i));
	return unstarror(fn, index);
};

var wrapError = function wrapError(err, g) {
	if (!(err instanceof Error)) return err; // handle throw "some string";
	for (var gg = err.g; gg; gg = gg.prev) {
		if (gg === g) return err;
	}
	err = Object.create(err);
	err.g = g;
	if (!stackGetter) {
			Object.defineProperty(err, '__raw_stack__', {
				value: err.stack,
				enumerable: false,
				writable: false,
				configurable: false
			});
		}
	Object.defineProperty(err, 'stack', {
		get: function get() {
			return stackTrace(this);
		}
	});
	return err;
};

var stackTrace = function stackTrace(err) {
	var starredStack = function starredStack(e) {
		if (!e || !e.g) return "";
		var s = starredStack(Object.getPrototypeOf(e));
		for (var g = e.g; g.prev; g = g.prev) {
			var fname = g.prev.frame.name || "";
			var m = /\$\$(.*)\$\$/.exec(fname);
			if (m) fname = m[1];
			s += '    at ' + fname + ' (' + g.frame.file + ':' + g.frame.line + ')\n';
		}
		return s;
	};

	var extra;

	var rawStack = stackGetter ? stackGetter.call(err) : err.__raw_stack__;
	var m = / +at (GeneratorFunctionPrototype|(undefined|\[object Generator\])\.next|.*\.next \(<anonymous>\))/.exec(rawStack);
	var cut = m && m.index;
	if (cut < 0) cut = rawStack.indexOf('\n') + 1;
	var result = rawStack.substring(0, cut).replace(/\n.*regenerator.runtime.*/g, '') + //
	'    <<< yield stack >>>\n' + starredStack(err) + //
	'    <<< raw stack >>>\n' + rawStack.substring(cut);
	return result;
};

/**
 * Copyright (c) 2013 Bruno Jouhier <bruno.jouhier@sage.com>
 * MIT License
 */
var util = require('../util');
var glob = util.getGlobals('callbacks');

var counters = {
	slowAwait: 0,
	fastAwait: 0
};

if (typeof glob.yielded === "undefined") glob.yielded = true;
glob.PENDING = glob.PENDING || {};

Object.defineProperty(Frame.prototype, "name", {
	get: function get() {
		var fn = this.fn;
		return fn && (fn.__name__ || fn.name) || "unknown";
	}
});

Object.defineProperty(Frame.prototype, "info", {
	get: function get() {
		return this;
	}
});

var star = function star(fn, index, index2, returnArray) {
	return (/*#__PURE__*/regeneratorRuntime.mark(function _callee() {
			var _args = arguments;
			return regeneratorRuntime.wrap(function _callee$(_context) {
				while (1) {
					switch (_context.prev = _context.next) {
						case 0:
							_context.next = 2;
							return invoke(this, fn, _args, index, index2, returnArray);

						case 2:
							return _context.abrupt('return', _context.sent);

						case 3:
						case 'end':
							return _context.stop();
					}
				}
			}, _callee, this);
		})
	);
};

var unstarTemplate = function unstarTemplate(fn, options) {
	var index = options && (typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object' ? options.callbackIndex : options;
	if (index == null) index = fn.length;

	var F = function F() {
		var cb = arguments[index];
		if (typeof cb !== "function") {
				if (glob.allowBooleanPlaceholders && typeof cb === 'boolean') {
						if (cb) cb = util.defaultCallback;else return exports.future("", 0, null, wrapper.bind(this), index)(arguments);
					} else throw util.argError(fn.name, index, "function", typeof cb === 'undefined' ? 'undefined' : _typeof(cb));
			}
		var g = fn.apply(this, arguments);
		run.call(this, fn, g, cb);
	};
	// track the original name for stack frames
	F.__name__ = fn.name;
	return F;
};

var unstarBody = unstarTemplate.toString();
unstarBody = unstarBody.substring(unstarBody.indexOf('{'));
var unstarrors = [];

var stackGetter = (Object.getOwnPropertyDescriptor(new Error(), 'stack') || {}).get;

var keys = [];

exports.await = function (file, line, object, property, index1, index2, returnArray, args) {
	var bound = typeof property !== "function";
	var fn = bound ? object[property] : property;
	glob.frame = new Frame(file, line, fn);
	var key = '';
	if (index2 == null && !returnArray) {
			key = keys[index1] || (keys[index1] = 'starred-' + index1);
			var wrapper = fn[key];
			if (wrapper) {
					counters.fastAwait++;
					if (Array.isArray(args)) return wrapper.apply(object, args);else return bound ? wrapper.bind(object) : wrapper;
				}
		}
	counters.slowAwait++;
	if (typeof fn !== "function") throw util.typeError("cannot call", "function", fn);
	wrapper = star(fn, index1, index2, returnArray);
	if (!bound && key) {
			fn[key] = wrapper;
		}
	if (Array.isArray(args)) return wrapper.apply(object, args);else return bound ? wrapper.bind(object) : wrapper;
};

exports.async = function (fn, index, arity) {
	if (typeof fn !== "function") throw util.typeError("cannot wrap function", "function", fn);
	var unstarred = unstar(fn, index, arity);
	unstarred["starred-" + index] = fn;
	return unstarred;
};

exports.new = function (file, line, constructor, index) {
	if (typeof constructor !== "function") throw util.typeError("cannot instantiate", "function", constructor);
	glob.frame = new Frame(file, line, constructor);
	var starred = star(constructor, index);
	return (/*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
			var that,
			    _args2 = arguments;
			return regeneratorRuntime.wrap(function _callee2$(_context2) {
				while (1) {
					switch (_context2.prev = _context2.next) {
						case 0:
							that = Object.create(constructor.prototype);
							_context2.next = 3;
							return starred.apply(that, _args2);

						case 3:
							return _context2.abrupt('return', that);

						case 4:
						case 'end':
							return _context2.stop();
					}
				}
			}, _callee2, this);
		})
	);
};

exports.future = require('../future');
require('./builtins');