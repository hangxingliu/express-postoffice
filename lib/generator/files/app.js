let postOffice = require('express-postoffice'),
	// favicon = require('serve-favicon'),
	log = require('morgan');

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
app.addModule('parser-json', { name: 'body-parser', method: 'json' });
app.addModule('parser-urlencoded',
	{ name: 'body-parser', method: 'urlencoded', args: { extended: false } });

app.addModule('cookie', 'cookie-parser');
//#generator(addModuleEndPoint)

// app.addAsCommon('favicon', favicon(join(__dirname, 'public', 'favicon.ico')) );
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
// app.useCommon('favicon');
app.useCommon('cookie');
app.use('/', postOffice.static(join(__dirname, 'public') ));

//resolve
//    Scan and add controllers into app
//    And resolve default view engine
app.resolve();

//After all controllers
app.useCommon('404', '500');

module.exports = app;