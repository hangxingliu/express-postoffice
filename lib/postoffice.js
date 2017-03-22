let express = require('express'),
	log = require('debug')('postoffice:main'),
	controllerLoader = require('./loader/controllers'),
	commonLoader = require('./loader/common'),
	moduleLoader = require('./loader/module'),
	{ isAbsolute, join } = require('path');

exports = module.exports = createApplication;

createApplication.static = express.static;
createApplication.exportController = obj => obj;

function createApplication(opts) {
	convertOptionPath(opts);

	let commonMiddlewares = {};

	let app = express();

	app._getCommon = getCommonMiddleware;
	app.resolve = solveControllers;
	app.addModule = addModule;
	app.addAsCommon = addAsCommon;
	app.useCommon = useCommon;
	
	// set up default views and engine
	app.set('views', opts.views || 'views');
	opts.engine && app.set('view engine', opts.engine);
	
	// load common middlewares
	commonLoader.load(app, opts.common);
	return app;

	function addAsCommon(name, ...handlers) {
		if (name in commonMiddlewares)
			throw new Error(`There has existed a common middleware named "${name}"`);
		commonMiddlewares[name] = handlers;
	}
	function addModule(as, module) { moduleLoader.load(app, as, module); }

	function useCommon(...names) {
		names.forEach(name => app.use(getCommonMiddleware(name)));
	}

	function solveControllers() {
		controllerLoader.load(app, opts.controllers);
	}	
	
	/**
	 * @param {string} name 
	 */	
	function getCommonMiddleware(name) {
		if (name in commonMiddlewares)
			return commonMiddlewares[name];
		throw new Error(`There has not a common middleware named "${name}"`);
	}
}

function convertOptionPath(opts) {
	if (!opts)
		throw new Error(`Missing options`);
	let { base, controllers, common, views } = opts;

	if (!base)
		throw new Error(`Missing option "base"`);
	
	opts.controllers = toArray(controllers).map(toAbsPath);
	opts.common = toArray(common).map(toAbsPath);
	opts.views = toAbsPath(views);
	return opts;

	function toArray(ele) {
		return ele ? (Array.isArray(ele) ? ele : [ele]) : []; 
	}
	function toAbsPath(path) {
		return isAbsolute(path) ? path : join(base, path); 
	}
}