"use strict";
/**
 * Copyright (c) 2013 Bruno Jouhier <bruno.jouhier@sage.com>
 * MIT License
 */
var util = require('./util');
var glob = util.getGlobals('generators');

function link(src, name, dst) {
	Object.defineProperty(src, name, {
		configurable: false,
		writable: true,
		enumerable: false,
		value: dst
	});
	return dst;
}

function makeArgs(i) {
	if (i <= 0) return "";
	return i > 1 ? makeArgs(i - 1) + ', a' + i : "a1";
}

if (typeof glob.yielded === "undefined") glob.yielded = true;
glob.PENDING = glob.PENDING || {};

function isGenerator(val) {
	return val && (
	Object.prototype.toString.call(val) === "[object Generator]" || val.toString() === "[object Generator]");
}

function Frame(g) {
	this.g = g;
	this.prev = glob.frame;
	g.frame = this;
	this.name = glob.calling || "unknown";
	this.file = "unknown";
	this.line = 0;
	this.recurse = 0;
	this.yielded = 0;
}

Object.defineProperty(Frame.prototype, "info", {
	get: function() {
		return this;
	}
});

function pushFrame(g) {
	glob.frame = g.frame || new Frame(g);
	if (glob.emitter) glob.emitter.emit('enter', g.frame);
}

function popFrame(g) {
	if (!glob.frame) return;
	if (glob.emitter) glob.emitter.emit('exit', g.frame);
	glob.frame = glob.frame.prev;
}

function run(g, cb, options) {
	var rsm = glob.resume;
	var emit = function(ev, g) {
			g.frame = g.frame || new Frame(g);
			if (glob.emitter) glob.emitter.emit(ev, g.frame);
		}

	try {
		glob.resume = function(err, val) {
			if (glob.yielded) {
				emit("resume", g);
				glob.yielded = false;
			}
			while (g) {
				if (options && options.interrupt && options.interrupt()) return;
				try {
					// ES6 is deprecating send in favor of next. Following line makes us compatible with both.
					var send = g.send || g.next;
					var v = err ? g.
					throw (err) : send.call(g, val);
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
						if (err) err = wrapError(err, g, glob.resume);
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
					err = wrapError(ex, g, glob.resume);
					popFrame(g);
					g = g.prev;
					val = undefined;
				}
			}
			// we have exhausted the stack of generators. 
			// return the result or error through the callback.
			cb(err, val);
		}

		// start the resume loop
		glob.resume();
	} finally {
		// restore resume global
		glob.resume = rsm;
	}
}

function mapResults(options, args) {
	if (options && typeof options === "object") {
		if (options.returnArray) return args;
		if (options.returnObject) return options.returnObject.reduce(function(res, key, i) {
			res[key] = args[i];
			return res;
		}, {});
	}
	return args[0];
}

function getTag(options, idx) {
	if (options && typeof options === "object") {
		if (options.returnArray) return "A" + idx;
		if (options.returnObject) return "O" + options.returnObject.join('/') + idx;
	}
	return idx;
}

function invoke(that, fn, args, idx, options) {
	if (fn['__unstarred__' + idx]) throw new Error("cannot invoke starred function: " + fn['__unstarred__' + idx]);
	// Set things up so that call returns:
	// * PENDING if it completes with a pending I/O (and cb will be called later)
	// * [PENDING, e, r] if the callback is called synchronously.
	var result = glob.PENDING,
		sync = true;
	var rsm = glob.resume;

	// convert args to array so that args.length gets correctly set if idx is args.length
	args = Array.prototype.slice.call(args, 0);
	var cx = glob.context;
	var callback = function(e, r) {
			var oldContext = glob.context;
			var oldResume = glob.resume;
			try {
				if (options) r = mapResults(options, Array.prototype.slice.call(arguments, 1));
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
		}
	if (options.errbackIndex != null) {
		args[idx] = function(r) {
			callback(null, r);
		}
		args[options.errbackIndex] = function(e) {
			callback(e);
		}
	} else {
		args[idx == null ? args.length : idx] = callback;
	}
	fn.apply(that, args);
	sync = false;
	return result;
}

var starTemplate = function(fn, options) {
		var idx = (options && typeof options === 'object') ? options.callbackIndex : options;
		var idx2 = idx < 0 ? -(idx + 1) : idx;
		var tag = getTag(options, idx);

		if (options && options.file) {
			var frame = glob.frame;
			if (frame) {
				frame.file = options.file;
				frame.line = options.line;
			}
			// we pass the name of the function via a global - would be great if JS had an API to get generator function from generator
			glob.calling = fn.__name__ || fn.name;
		}
		var key = '__starred__' + tag;
		if (fn[key]) return fn[key];

		//if (idx == null) idx = fn.length - 1;
		var F = function *() {
				if (idx < 0) Array.prototype.splice.call(arguments, idx2, 0, null);
				return (yield invoke(this, fn, arguments, idx2, options));
			};
		link(F, '__unstarred__' + tag, fn);
		link(fn, key, F);
		return F;
	}

var starBody = starTemplate.toString();
starBody = starBody.substring(starBody.indexOf('{'));
var starrors = [];

function makeStarror(i) {
	return eval("(function(fn, options)" + starBody.replace(/function\s*\*\s*\(\)/, "function*(" + makeArgs(i) + ")") + ")");
}

function star(fn, idx, arity) {
	var i = arity != null ? arity : fn.length;
	var starror = starrors[i] || (starrors[i] = makeStarror(i));
	return starror(fn, idx);
}

var unstarTemplate = function(fn, options) {
		var idx = (options && typeof options === 'object') ? options.callbackIndex : options;
		if (idx == null) idx = fn.length;
		var idx2 = idx < 0 ? -(idx + 1) : idx;

		var key = '__unstarred__' + idx;
		if (fn[key]) return fn[key];

		var F = function F() {
				var cb = arguments[idx2];
				if (idx < 0) Array.prototype.splice.call(arguments, idx2, 1);
				if (typeof cb !== "function") {
					// if cb is false, return a future
					if (cb === false) return exports.future("(future)", 0, null, F, idx2)(arguments);
					throw util.argError(fn.name, idx, "function", typeof cb);
				}
				var g = fn.apply(this, arguments);
				run.call(this, g, cb);
			};
		link(F, '__starred__' + idx, fn);
		link(fn, key, F);
		// track the original name for stack frames
		F.__name__ = fn.name;
		return F;
	}

var unstarBody = unstarTemplate.toString();
unstarBody = unstarBody.substring(unstarBody.indexOf('{'));
var unstarrors = [];

function makeUnstarror(i) {
	return eval("(function(fn, options)" + unstarBody.replace(/function\s*F\(\)/, "function F(" + makeArgs(i) + ")") + ")");
}

function unstar(fn, idx, arity) {
	var i = arity != null ? arity : (idx == null ? fn.length + 1 : fn.length);
	var unstarror = unstarrors[i] || (unstarrors[i] = makeUnstarror(i));
	return unstarror(fn, idx);
}

function wrapError(err, g, resume) {
	if (!(err instanceof Error)) return err; // handle throw "some string";
	if (err.__frame__) return err;
	err = Object.create(err);
	err.__frame__ = glob.frame;
	Object.defineProperty(err, 'stack', {
		get: function() {
			return stackTrace(this);
		}
	});
	return err;
}

function stackTrace(err) {
	var extra;
	var starredStack = "";
	var frame;
	while (frame = err.__frame__) {
		for (frame = frame.prev; frame; frame = frame.prev) {
			var m = /\$\$(.*)\$\$/.exec(frame.name);
			var fname = (m && m[1]) || "unknown";
			starredStack += '    at ' + fname + ' (' + frame.file + ':' + frame.line + ')\n';
		}
		err = Object.getPrototypeOf(err);
	}
	var rawStack = Object.getOwnPropertyDescriptor(new Error(), 'stack').get.call(err);
	var cut = rawStack.indexOf('    at GeneratorFunctionPrototype');
	if (cut < 0) cut = rawStack.indexOf('\n') + 1;
	var result = rawStack.substring(0, cut).replace(/\n.*regenerator.runtime.*/g, '') + //
	'    <<< yield stack >>>\n' + starredStack + //
	'    <<< raw stack >>>\n' + rawStack.substring(cut);
	return result;
}

exports.await = function(file, line, object, property, index1, index2, returnArray) {
	var bound = typeof property !== "function";
	var that = bound ? object : null;
	var fn = bound ? object[property] : property;
	if (typeof fn !== "function") throw util.typeError("cannot call", "function", fn);
	return star(fn, {
		file: file,
		line: line,
		callbackIndex: index1,
		errbackIndex: index2,
		returnArray: returnArray,
	}).bind(that);
};

exports.async = function(fn, index, arity) {
	if (typeof fn !== "function") throw util.typeError("cannot wrap function", "function", fn);
	var unstarred = unstar(fn, index, arity);
	unstarred["awaitWrapper-" + index + "-null-false"] = fn;
	return unstarred;
}

exports.new = function(file, line, constructor, index) {
	if (typeof constructor !== "function") throw util.typeError("cannot instantiate", "function", constructor);
	var starred = star(constructor, index);
	var key = '__new__' + idx;
	if (starred[key]) return starred[key];

	var F = function *() {
			var that = Object.create((idx != null ? starred['__unstarred__' + idx] : starred).prototype);
			yield starred.apply(that, arguments);
			return that;
		};
	link(starred, key, F);
	return F;
};

exports.future = require('./future');