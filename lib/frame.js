"use strict";

var util = require('./util');
var g = util.getGlobals();

function Frame(fn, file, line) {
	this.prev = g.frame;
	this.name = fn.name;
	this.file = file;
	this.line = line;
	// initialize streamline-flamegraph fields to make it monomorphic
	this.recurse = 0;
	this.yielded = 0;
	this.id = 0;
}

exports.pushFrame = function(fn, file, line) {
	var frame = g.frame = new Frame(fn, file, line);
	g.emitter.emit('enter', frame);
	return frame;
}

Frame.prototype.pop = function() {
	if (g.frame !== this) throw new Error("FRAME MISMATCH: \n\t" + JSON.stringify(frame) + '\n\t' + JSON.stringify(g.frame));
	g.emitter.emit('exit', this);
	g.frame = this.prev;
}

Frame.prototype.resume = function(fn, err, result) {
	var oldFrame = g.frame;
	g.frame = this;
	if (emitter) {
		if (g.yielded) emitter.emit('resume', this);
		g.yielded = false;
	}
	try {
		fn(err, result);
	} finally {
		g.frame = oldFrame;
	}
}

Frame.prototype.yield = function() {
	if (!g.yielded) emitter.emit('yield', frame);
	g.yielded = true;
}