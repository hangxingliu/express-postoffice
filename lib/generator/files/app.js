let postOffice = require('express-postoffice'),
	favicon = require('serve-favicon'),
	log = require('morgan'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser');

let { join } = require('path');

let app = postOffice({
	base: __dirname,
	controllers: 'controllers',
	common: 'controllers/common',
	views: 'views',
	engine: '{{ engine }}'
});

/*
	WARNING:
		Do not modify content between two `#generator` comment
		if you want to add module by typing command `postoffice`
*/
//#generator(addModuleStartPoint)
app.addModule('parser-json', 'body-parser', 'json');
app.addModule('parser-urlencoded', 'body-parser', 'urlencoded', { extended: false });

app.addModule('cookie', 'cookieParser');
//#generator(addModuleEndPoint)

app.addAsCommon('favicon', favicon(join(__dirname, 'static', 'favicon.ico')) );
app.addAsCommon('404', (req, res, next) =>  {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});
app.addAsCommon('500', (err, req, res, next) => {
	res.status(err.status || 500);
	let debug = app.get('env') === 'development';
	res.send(`<h1>${err.message}</h1>` +
		`<h2>${debug ? err.status : ''}</h2>` +
		`<pre>${debug ? err.stack : ''}</pre>`);
});

//Before all controllers
app.useCommon('favicon');
app.use('')
app.useCommon('cookie');
app.use('/', postOffice.static('/public'));

//resolve
//    Scan and add controllers into app
//    And resolve default view engine
app.resolve();

//After all controllers
app.useCommon('404', '500');

module.exports = app;