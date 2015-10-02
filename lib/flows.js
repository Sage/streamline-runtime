"use strict";
var runtime = require('./util').getGlobals().runtime;
if (runtime) module.exports = require('./' + runtime + '/flows');
else module.exports = require('./callbacks/flows');