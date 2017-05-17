"use strict";

// This script rebuilds the lib/builtins-*.js files
// It is run before publishing to NPM.
// You must npm install babel and babel-plugin-streamline before running it.
var babel = require('babel-core');
require('babel-plugin-streamline');
var fs = require('fs');
var fsp = require('path');

function build(src, dst, runtime, fix) {
	var es2015 = require('babel-preset-es2015');
	var regeneratorPlugin = es2015.plugins[es2015.plugins.length - 1];
	regeneratorPlugin[1].generators = (runtime !== 'generators');
	var babelOptions = {
		plugins: [[require('babel-plugin-streamline'), {
			runtime: runtime,
			verbose: true,
		}]],
		presets: es2015,
	};

	babelOptions.filename = src;
	babelOptions.sourceFileName = src;
	//babelOptions.sourceMaps = "inline";
	var source = fs.readFileSync(fsp.join(__dirname, 'src', src), 'utf8');
	var code = babel.transform(source, babelOptions).code;
	if (fix) code = fix(code);
	var outfile = fsp.join(__dirname, 'lib', dst)
	console.log("creating ", outfile)
	fs.writeFileSync(outfile, code, 'utf8');
}

['builtins', 'flows'].forEach(function (mod) {
	['callbacks', 'await', 'fibers', 'generators'].forEach(function (runtime) {
		build(mod + '._js', runtime + '/' + mod + '.js', runtime);
	});
})
build('../lib/generators/runtime.js', 'callbacks/runtime.js', 'callbacks', function (code) {
	return code.replace(/getGlobals\('generators'\)/g, "getGlobals('callbacks')");
});
