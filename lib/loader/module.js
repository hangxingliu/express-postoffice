let log = require('debug')('postoffice:load-module');

/*
fn(moduleName: string, opts?: any);
fn(asCommonName: string, moduleName: string, opts?: any);
fn(asCommonName: string, moduleName: string, methodName: string, opts?: any);
*/

function load(postOffice, as, module) {
	if (!as)
		throw new Error(`Missing param "as"`);	
	if (!module) module = as;

	let moduleName = typeof module == 'string' ? module : (module.name || as);
	let moduleMethod = module.method;
	let moduleArgs = module.args;

	let object;
	if (moduleMethod)
		object = require(moduleName)[moduleMethod](moduleArgs);
	else
		object = require(moduleName)(moduleArgs);
	
	postOffice.addAsCommon(as, object);
}

module.exports = { load };