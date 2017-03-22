let { printHeader } = require('./header'),
	{ isAbsolute, join } = require('path'),
	{ existsSync, readFileSync, writeFileSync } = require('fs'),
	mkdirp = require('mkdirp').sync,
	remove = require('remove').removeSync,
	app = require('commander');

require('colors');

module.exports = function (argv) {
	app.usage('[options] [directory] [name]')
		.description('')
		.version('0.0.1')
		.option('-f --force', 'remove it if the target directory is exists')
		.option('-v --views <engine>', 'which views engine, available: pug(default), ejs', 'pug')
		.parse(argv);

	printHeader();
	
	let engine = app.views;
	let [path, name] = app.args;
	
	if (['pug', 'ejs'].indexOf(engine) < 0) {
		console.error(`error: Unknown engine "${engine}". (available: pug, ejs)`.red);
		process.exit(1);
	}

	if (typeof path == 'string' && typeof name == 'undefined') {
		name = path;
		path = void 0;
	}

	path = typeof path == 'string' ? path : process.cwd();
	name = typeof name == 'string' ? name : 'app';

	path = isAbsolute(path) ? path : join(process.cwd(), path);

	generate({ name, path, engine, force: app.force || false });

	function generate({ name, path, force, engine }) {
		console.log([
			'generation info:',
			`  project name : ${name.cyan}`,
			`  generate to :  ${path.cyan}`,
			`  force mode :   ${String(force).cyan}`
		].join('\n'));

		let targetDirectory = join(path, name);
		
		if (existsSync(targetDirectory)) {
			console.log(`target directory is exists`.yellow);
			if (!force) {
				console.error(`error: please turn option "-f" on to remove target directory`.red);
				process.exit(1);
			}
			remove(targetDirectory);
			console.log(`target directory has been removed`);
		}	

		mkdirp(targetDirectory);
		console.log(`target directory has been created`);

		console.log('');		
		//generate folders
		let directories = [
			'controllers',
			'controllers/common',
			'views',
			'public',
			'bin'
		];
		directories.forEach(directory =>
			mkdirp(join(targetDirectory, directory)) +
			console.log(`${directory.cyan} ${'be created'.grey}`));
		
		console.log('');		
		//copy files
		let files = [
			['gitignore', '.gitignore'],
			['app.js', 'app.js'],
			[`package-${engine}.json`, 'package.json'],
			['index.html', 'public/index.html'],
			['users.js', 'controllers/users.js'],
			['www', 'bin/www'],
		], context = { engine, name };
		files.forEach(([from, to]) =>
			copyFile(
				join(__dirname, 'files', from),
				join(targetDirectory, to), context) +
			console.log(`${to.cyan} ${'be copied'.grey}`));
		
		console.log(`\ndone!`.green);
	}


	function copyFile(from, to, context) {
		let content = readFileSync(from, 'utf8');
		content = content.replace(/\{\{\s+(\w+?)\s+\}\}/g, (_, name) => context[name] || '');
		writeFileSync(to, content);
	}
}