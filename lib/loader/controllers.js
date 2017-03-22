let log = require('debug')('postoffice:load-controllers'),
	express = require('express'),
	{ readdirSync, statSync } = require('fs'),
	{ join, basename, dirname} = require('path');


/**
 * @param {any} postOffice 
 * @param {Array<string>} path 
 */
function load(postOffice, path) {
	if (!Array.isArray(path))
		path = [path];
	path.forEach(p => {
		log(`scanning controllers in directory "${p}"`);
		let stat = statSync(p);
		if (!stat.isDirectory())
			throw new Error(`The controllers path "${p}" is not a directory`);
		let files = readdirSync(p);
		files.forEach(file => {
			file = join(p, file);
			if(file.endsWith('.js') &&statSync(file).isFile())
				loadFile(postOffice, file)
		});
	});
}

/**
 * @param {any} postOffice 
 * @param {string} filePath 
 */
function loadFile(postOffice, filePath) {
	log(`loading controller in "${filePath}"`);
	let router = express();
	let dir = dirname(filePath);
	let controller = require(filePath);
	let { name, path, before, views, engine, actions, _default } = controller;

	path = path || getDefaultControllerPath(filePath) || '';

	if (!path)
		throw new Error(`Could not get controller name of file ${basename(filePath)}`);	

	name = name || path;

	views && router.set('views', join(dir, views));
	engine && router.set('view engine', engine);

	if (before) {
		if (!Array.isArray(before))
			before = [before];
		before.forEach(b =>
			router.use(typeof b == 'string' ? postOffice._getCommon(b) : b));
	}

	if (!actions)
		throw new Error(`Missing field "actions" in controller "${name}"`);
	
	for (let _name in actions) {
		let action = actions[_name];
		let actionName = action.name || _name,
			actionMethod = action.method || 'use',
			actionPath = action.path || ('/' + actionName),
			actionBefore = action.before || [],
			params = [];
		
		if (!Array.isArray(actionBefore))
			actionBefore = [actionBefore];
		
		actionBefore.forEach(b =>
			params.push(typeof b == 'string' ? postOffice._getCommon(b) : b));
		
		params.push(action);

		router[actionMethod](actionPath, ...params);
	}

	if (_default)
		router.use(typeof _default == 'string' ? postOffice._getCommon(_default) : _default);	
	
	postOffice.use(path, router)
}

function getDefaultControllerPath(filePath) {
	let name = basename(filePath),
		border = name.indexOf('.');
	return '/' + (border < 0 ? name : name.slice(0, border) );
}

module.exports = {
	load
};