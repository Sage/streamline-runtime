"use strict";

// This script rebuilds the lib/builtins-*.js files
// It is run before publishing to NPM.
// You must npm install babel and babel-plugin-streamline before running it.
var babel = require('babel');
require('babel-plugin-streamline');
var fs = require('fs');
var fsp = require('path');

function build(src, dst, runtime) {
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
	fs.writeFileSync(fsp.join(__dirname, 'lib', dst), code, 'utf8');
}

build('builtins._js', 'builtins-callbacks.js', 'callbacks');
build('builtins._js', 'builtins-await.js', 'await');
build('builtins._js', 'builtins-fibers.js', 'fibers');
build('builtins._js', 'builtins-generators.js', 'generators');
build('runtime-generators.js', 'runtime-callbacks.js', 'callbacks');
