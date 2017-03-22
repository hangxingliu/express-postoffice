const FROM = `${__dirname}/_src`;
const TO = `${__dirname}/generated_test_files`


var Mocha = require('mocha'),
	fs = require('fs-extra');

var mocha = new Mocha();

fs.existsSync(TO) &&
	fs.removeSync(TO);
fs.mkdirsSync(TO);

var files = fs.readdirSync(FROM).filter(file => file.endsWith('.js'));
console.log(`Scanned ${files.length} test files`);
files.forEach(fileName => {
	fs.writeFileSync(`${TO}/${fileName}`,
		handlerTestFile(fs.readFileSync(`${FROM}/${fileName}`, 'utf8')));
	mocha.addFile(`${TO}/${fileName}`);
});

// Run the tests.
console.log(`Start test by mocha ...`);
mocha.useColors(true);
mocha.reporter('../../../test/mocha-vscode-problem-reporter');
mocha.run(function (failures) {
	process.on('exit', function () {
		process.exit(failures); // exit with non-zero status if there were failures
	});
});

function handlerTestFile(content) {
	return `require('colors');require('should');${content}`;
}