var Logger = function() {
	var log4js = require('log4js');
	return log4js.getLogger();
}
module.exports = new Logger();
