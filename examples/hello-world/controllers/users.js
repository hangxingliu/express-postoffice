var postoffice = require('../../..');

var exampleUsers = [
	'LiuYue',
	'LiLei',
	'HanMeimei'
];

function all(req, res, next){
	res.send(exampleUsers.join('<br />'));
}

module.exports = postoffice.exportController({
	name: 'User Controller',
	path: '/user',
	before: ['parser-json', 'parser-urlencoded'],
	actions: {
		all
	}
});