/*
 * Library that demonstrates something throwing when it's init() is call
 *
 */

 // Container for module (to be exported)

 var debug = {};

 // Init function

 debug.init = function() {
 	// This is an error created intentionally (bar is not defined)
 	var foo = bar;
 }

 // Export the module 

 module.exports = debug;