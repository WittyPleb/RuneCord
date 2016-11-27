var _chalk = require('chalk');

var chalk = new _chalk.constructor({
	enabled: true
});

/**
 * @class
 * @classdesc Used to log text to the console
 * @prop {Boolean} logTimestamp If a timestamp should be displayed.
 * @prop {String} {commandColor} The color to use for command logging.
 */
class Logger {

	/**
	 * @constructor
	 * @arg {Boolean} logTimestamp If a timestamp should be displayed.
	 * @arg {String} [commandColor] The color to use for command logging. Must be a valid [chalk color]{@link https://github.com/chalk/chalk#colors}.
	 */
	constructor(logTimestamp, commandColor) {
		this.logTimestamp = !!logTimestamp;
		this.commandColor = commandColor;
	}

	/**
	 * Set the color to use for command logging.
	 * @arg {String} value The color
	 */
	set color(value) {
		this.commandColor = value;
	}

	/**
	 * Get a timestamp
	 * @type {String}
	 */
	get timestamp() {
		return this.logTimestamp === true ? `[${new Date().toLocaleString()}]` : '';
	}

	/**
	 * Logs something
	 * @arg {String} text
	 * @arg {String} [color] A valid chalk color
	 */
	log(text, color) {
		return console.log(this.timestamp + (color ? chalk[color](text) : text));
	}

	/**
	 * Logs something with a background color
	 * @arg {String} text
	 * @arg {String} background The background color
	 * @arg {String} [color] A valid chalk color
	 */
	logWithBackground(text, background, color) {
		return console.log(this.timestamp + (color ? chalk[background][color](text) : chalk[background](text)));
	}

	/**
	 * Logs something bold
	 * @arg {String} text
	 * @arg {String} [color] A valid chalk color
	 */
	logBold(text, color) {
		return console.log(this.timestamp + (color ? chalk.bold[color](text) : chalk.bold(text)));
	}

	/**
	 * Logs something underlined
	 * @arg {String} text
	 * @arg {String} [color] A valid chalk color
	 */
	logWithUnderline(text, color) {
		return console.log(this.timestamp + (color ? chalk.underline[color](text) : chalk.underline(text)));
	}

	/**
	 * Logs something with a header
	 * @arg {String} headerText
	 * @arg {String} headerBackground A valid [chalk background color]{@link https://github.com/chalk/chalk#background-colors}.
	 * @arg {String} headerColor A valid [chalk color]{@link https://github.com/chalk/chalk#colors}
	 * @arg {String} text
	 * @arg {String} [color] A valid chalk color.
	 */
	logWithHeader(headerText, headerBackground, headerColor, text, color) {
		return console.log(this.timestamp + chalk[headerBackground][headerColor || 'black'](` ${headerText} `), (color ? chalk[color](text) : text));
	}
}

module.exports = Logger;