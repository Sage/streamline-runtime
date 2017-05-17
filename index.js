"use strict";

/// !doc
/// 
/// # Global context API
/// 
/// The global `context` is a reference which is maintained across asynchronous calls.
/// 
/// This context is very handy to store information that all calls should be able to access
/// but that you don't want to pass explicitly via function parameters. The most obvious example is
/// the `locale` that each request may set differently and that your low level libraries should
/// be able to retrieve to format messages.
/// 
/// `var globals = require('streamline-runtime').globals`
/// 
/// * `globals.context = ctx`
/// * `ctx = globals.context`  
///   sets and gets the context
/// 
/// Note: an empty context (`{}`) is automatically set by the server wrappers of the `ez-streams` module,
/// before they dispatch a request. So, with these wrappers, each request starts with a fresh empty context.
// This module may be loaded several times so we need a true global (with a secret name!).
// This implementation also allows us to share the context between modules compiled in callback and fibers mode.

var util, flows; // cache for required modules

// API for typescript consumers
var futureModule = require('./lib/future');
exports._ = {
	future: function (thunk) {
		return futureModule(__filename, 0, null, thunk, 0, null, null, [false]);
	},
	promise: function (thunk) {
		return exports._.future(thunk).promise;
	},
	run: function (thunk, callback) {
		thunk(callback || function (err) { if (err) throw err; });
	},
	cast: function (fn) {
		return fn;
	},
};

// APIs that were in flows and globals before and that we are
// making directly available as _.funnel, _.collect, ...
['funnel', 'collect', 'withContext', 'handshake', 'queue', 'sleep', 'wait'].forEach(function (method) {
	Object.defineProperty(exports._, method, {
		get: function () {
			return (flows || (flows = require('./lib/flows')))[method];
		}
	});
});

Object.defineProperty(exports._, 'context', {
	get: function () {
		return (util || (util = require('./lib/util'))).getGlobals().context;
	}
	// do not export setter - use _.withContext
});

Object.defineProperty(exports._, 'runtime', {
	get: function () {
		return (util || (util = require('./lib/util'))).getGlobals().runtime || util.defaultRuntime();
	}
});

// Obsolete API that we don't advertize to typescript.
Object.defineProperty(exports, 'runtime', {
	get: function () {
		return (util || (util = require('./lib/util'))).getGlobals().runtime || util.defaultRuntime();
	}, set: function (value) {
		(util || (util = require('./lib/util'))).getGlobals(value);
	}
});

Object.defineProperty(exports, 'globals', {
	get: function () {
		return (util || (util = require('./lib/util'))).getGlobals();
	}
});

Object.defineProperty(exports, 'flows', {
	get: function () {
		return (flows || (flows = require('./lib/flows')));
	}
});
