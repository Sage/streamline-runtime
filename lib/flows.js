"use strict";
var runtime = require('./util').getGlobals().runtime;
function idem(x) { return x; } // streamline-require compat
if (runtime) module.exports = require(idem('./' + runtime + '/flows'));
else module.exports = require('./callbacks/flows');