const chalk = require("chalk");

class Logger {
	/**
	 *
	 * @param {string} instance
	 */
	constructor(instance) {
		this.instance = instance;
	}

	get logHeader() {
		return `FELIX [${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}] [${this.instance || 'SYSTEM'}]`;
	}

	log(...additional) {
		additional.forEach(msg => {
			String(msg).split('\n').forEach(m => console.info(this.formatMessage(m, 'info')));
		});
	}

	info(...additional) {
		additional.forEach(msg => {
			String(msg).split('\n').forEach(m => console.info(this.formatMessage(m, 'info')));
		});
	}

	warn(...additional) {
		additional.forEach(msg => {
			String(msg).split('\n').forEach(m => console.warn(this.formatMessage(m, 'warn')));
		});
	}

	error(...additional) {
		additional.forEach(msg => {
			String(msg).split('\n').forEach(m => console.error(this.formatMessage(m, 'error')));
		});
	}

	verbose(...additional) {
		if (process.env.VERBOSE) {
			additional.forEach(msg => {
				String(msg).split('\n').forEach(m => console.debug(this.formatMessage(m, 'verbose')));
			});
		}
	}

	debug(...additional) {
		if (process.env.DEBUG) {
			additional.forEach(msg => {
				String(msg).trim().split('\n').forEach(m => console.debug(this.formatMessage(m, 'debug')));
			});
		}
	}

	formatMessage(msg, level) {
		let format = `FELIX [${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}] [${this.instance || 'SYSTEM'}] [${level.toUpperCase()}]: ${msg}`;
		switch(level) {
			case 'warn':
				format = chalk.yellow(format);
				break;
			case 'error':
				format = chalk.red(format);
				break;
			case 'debug':
				format = chalk.gray(format);
				break;
		}
		return format;
	}
}

module.exports = Logger;