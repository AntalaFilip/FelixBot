const chalk = require("chalk");

class Logger {
	/**
	 *
	 * @param {string} instance
	 */
	constructor(instance) {
		this.instance = instance;
	}

	log(toLog, ...additional) {
		const log = `[${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}] [${this.instance || 'SYSTEM'}/INFO]: ${toLog}`;
		console.log(log, ...additional);
	}

	info(toLog, ...additional) {
		const log = `[${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}] [${this.instance || 'SYSTEM'}/INFO]: ${toLog}`;
		console.info(log, ...additional);
	}

	warn(toLog, ...additional) {
		const log = chalk.yellow(`[${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}] [${this.instance || 'SYSTEM'}/WARN]: ${toLog}`);
		console.warn(log, ...additional);
	}

	error(toLog, ...additional) {
		const log = chalk.red(`[${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}] [${this.instance || 'SYSTEM'}/ERROR]: ${toLog}`);
		console.error(log, ...additional);
	}

	debug(toLog, ...additional) {
		const log = chalk.gray(`[${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}] [${this.instance || 'SYSTEM'}/DEBUG]: ${toLog}`);
		console.debug(log, ...additional);
	}
}

module.exports = Logger;