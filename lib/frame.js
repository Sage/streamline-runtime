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

exports.pushFrame = function (file, line, fname) {
	var frame = g.frame = new Frame(file, line, fname);
	//console.error("PUSH ", frame.depth(), file, line);
	if (g.emitter) g.emitter.emit('enter', frame);
	return frame;
}
Frame.prototype.depth = function () {
	return this.prev ? this.prev.depth() + 1 : 0;
}


Frame.prototype.pop = function () {
	//console.error("POP  ", this.depth(), this.file, this.line);
	if (g.frame !== this) {
		console.error("FRAME MISMATCH: \n\t" + JSON.stringify(this) + '\n\t' + JSON.stringify(g.frame));
		process.exit();
	}
	if (g.frame !== this) throw new Error("FRAME MISMATCH: \n\t" + JSON.stringify(this) + '\n\t' + JSON.stringify(g.frame));
	if (g.emitter) g.emitter.emit('exit', this);
	g.frame = this.prev;
}

Frame.prototype.resume = function () {
	if (g.emitter) {
		if (g.yielded) g.emitter.emit('resume', this);
		g.yielded = false;
	}
}

Frame.prototype.yield = function () {
	if (!g.yielded && g.emitter) g.emitter.emit('yield', this);
	g.yielded = true;
}

exports.wrap = function (file, line, fn) {
	return function () {
		var frame = exports.pushFrame(file, line, fn.name);
		try {
			return fn.apply(this, arguments);
		} finally {
			frame.pop();
		}
	}
}

