"use strict";
// colors package does not work in browser - fails on reference to node's `process` global
var idem = function (x) { return x; };
var colors;
if (typeof (process) !== 'undefined' && !process.browser) {
	try {
		colors = require(idem('colors'));
	} catch (ex) {
		// console.error(ex.stack);
	}
}
if (!colors) colors = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white', 'gray'].reduce(function (r, c) {
	r[c] = idem;
	return r;
}, {});

function log(message) {
	console.error(colors.gray("[STREAMLINE-RUNTIME] " + message));
}
function warn(message) {
	console.error(colors.magenta("[STREAMLINE-RUNTIME] " + message));
}
function error(message) {
	console.error(colors.red("[STREAMLINE-RUNTIME] " + message));
}

function trace(obj) {
	if (obj instanceof TypeError) util.error(obj.stack);
	//else console.error(obj);
};

function typeName(val) {
	return val === null ? "null" : typeof val;
}

function typeError(message, expected, got) {
	var err = new TypeError(message + ": expected " + expected + ", got " + typeName(got));
	console.error(err.stack);
	throw err;
}

function argError(fname, index, expected, got) {
	return typeError("invalid argument " + index + " to function `" + fname + "`", expected, got);
}

function getGlobals(runtime) {
	var glob = typeof global === "object" ? global : window;
	var secret = "_20c7abceb95c4eb88b7ca1895b1170d1";
	var g = (glob[secret] = (glob[secret] || { context: {} }));
	if (runtime && g.runtime !== runtime) {
		if (g.runtime) console.warn("[STREAMLINE-RUNTIME] " + runtime + " runtime loaded on top of " + g.runtime);
		else g.runtime = runtime;
	}
	return g;
}

function defaultCallback(err) {
	if (err) throw err;
}

// fix names in stack traces
var origPrepareStackTrace = Error.prepareStackTrace;
if (origPrepareStackTrace) Error.prepareStackTrace = function (_, stack) {
	// eval stack frames from streamline-runtime fibers are botched: column number is 0, 
	// which causes an error in source-map-support.js / mapEvalOrigin.
	// So we filter them out.
	// We also filter out frames that streamline inserts between calls (fibers mode only).
	var canSkip = false;
	stack = stack.filter(function (frame) {
		var sourceName = frame.getFileName() || frame.getScriptNameOrSourceURL() || '';
		var isStreamline = /streamline-runtime.lib.fibers.runtime/.test(sourceName);
		if (!isStreamline) canSkip = true;
		if (canSkip && isStreamline) return false;
		var origin = frame.isEval() && frame.getEvalOrigin();
		return (!(origin && /\bstreamline-runtime\b/.test(origin)));
	});
	var result;
	try {
		result = origPrepareStackTrace.call(this, _, stack);
	} catch (ex) {
		result = "\n*** STACKTRACE PREPARE FAILED: " + ex.message + " ***\n" + stack.join('\n');
	}
	result = result.replace(/_\$\$(.*)\$\$\d*/g, function (all, x) { return x; })
		.replace(/Function\.(.*) \[as awaitWrapper-0\]/g, function (all, x) { return x; });
	return result;
};

function defaultRuntime() {
	var _defRT;
	return _defRT || (_defRT = (function () {
		try {
			require(idem('fibers'));
			return 'fibers';
		} catch (ex) { }
		try {
			eval("(function*(){})");
			return 'generators';
		} catch (ex) { }
		return "callbacks";
	})());
}

module.exports = {
	log: log,
	warn: warn,
	error: error,
	trace: trace,
	typeName: typeName,
	typeError: typeError,
	argError: argError,
	getGlobals: getGlobals,
	defaultCallback: defaultCallback,
	defaultRuntime: defaultRuntime,
};
var util = module.exports;
