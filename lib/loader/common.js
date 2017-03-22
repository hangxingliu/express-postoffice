let log = require('debug')('postoffice:load-common'),
	{ readdirSync, statSync } = require('fs'),
	{ join } = require('path');


/**
 * @param {any} postOffice 
 * @param {Array<string>} path 
 */
function load(postOffice, path) {
	if (!Array.isArray(path))
		path = [path];
	path.forEach(p => {
		let stat = statSync(p);
		if (!stat.isDirectory())
			throw new Error(`The common middleware path "${p}" is not a directory`);
		let files = readdirSync(p);
		files.forEach(file => {
			file = join(p, file);
			if (file.endsWith('.js') && statSync(file).isFile())
				loadFile(postOffice, file);
		});
	});
}

/**
 * @param {any} postOffice 
 * @param {string} filePath 
 */
function loadFile(postOffice, filePath) {
	let commonMiddlewares = require(filePath);

	for (let name in commonMiddlewares) {
		let middleware = commonMiddlewares[name];
		postOffice.addAsCommon(name, middleware);
	}
}

module.exports = {
	load
};