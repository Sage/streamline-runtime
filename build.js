"use strict";

// This script rebuilds the lib/builtins-*.js files
// It is run before publishing to NPM.
// You must npm install babel and babel-plugin-streamline before running it.
var babel = require('babel');
require('babel-plugin-streamline');
var fs = require('fs');
var fsp = require('path');

function build(src, dst, runtime, fix) {
	var babelOptions = {
		plugins: ['streamline'],
		whitelist: [],
		extra: {
			streamline: {
				runtime: runtime,
				verbose: true,
			},
		},
	};
	if (runtime === 'callbacks') babelOptions.whitelist.push('regenerator');
	babelOptions.filename = src;
	babelOptions.sourceFileName = src;
	//babelOptions.sourceMaps = "inline";
	var source = fs.readFileSync(fsp.join(__dirname, 'lib', src), 'utf8');
	var code =  babel.transform(source, babelOptions).code;
	if (fix) code = fix(code);
	fs.writeFileSync(fsp.join(__dirname, 'lib', dst), code, 'utf8');
}

['builtins', 'flows'].forEach(function(mod) {
	['callbacks', 'await', 'fibers', 'generators'].forEach(function(runtime) {
		build(mod + '-source._js', runtime + '/' + mod + '.js', runtime);
	});
})
build('generators/runtime.js', 'callbacks/runtime.js', 'callbacks', function(code) {
	return code.replace(/getGlobals\('generators'\)/g, "getGlobals('callbacks')");
});
