"use strict";

var util = require('./util');
var g = util.getGlobals();

function Frame(file, line, fname) {
	this.prev = g.frame;
	this.name = fname;
	this.file = file;
	this.line = line;
	// initialize streamline-flamegraph fields to make it monomorphic
	this.recurse = 0;
	this.yielded = 0;
	this.id = 0;
}

exports.pushFrame = function(file, line, fname) {
	var frame = g.frame = new Frame(file, line, fname);
	if (g.emitter) g.emitter.emit('enter', frame);
	return frame;
}

Frame.prototype.pop = function() {
	if (g.frame !== this) throw new Error("FRAME MISMATCH: \n\t" + JSON.stringify(this) + '\n\t' + JSON.stringify(g.frame));
	if (g.emitter) g.emitter.emit('exit', this);
	g.frame = this.prev;
}

Frame.prototype.resume = function() {
	if (g.emitter) {
		if (g.yielded) g.emitter.emit('resume', this);
		g.yielded = false;
	}
}

Frame.prototype.yield = function() {
	if (!g.yielded && g.emitter) g.emitter.emit('yield', this);
	g.yielded = true;
}