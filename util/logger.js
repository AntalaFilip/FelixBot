class Logger {
	/**
	 *
	 * @param {string} instance
	 */
	constructor(instance) {
		this.instance = instance;
	}

	log(toLog) {
		const log = `[${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}] [${this.instance || 'SYSTEM'}/INFO]: ${toLog}`;
		console.log(log);
	}

	info(toLog) {
		const log = `[${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}] [${this.instance || 'SYSTEM'}/INFO]: ${toLog}`;
		console.info(log);
	}

	warn(toLog) {
		const log = `[${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}] [${this.instance || 'SYSTEM'}/WARN]: ${toLog}`;
		console.warn(log);
	}

	error(toLog) {
		const log = `[${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}] [${this.instance || 'SYSTEM'}/ERROR]: ${toLog}`;
		console.error(log);
	}

	debug(toLog) {
		const log = `[${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}] [${this.instance || 'SYSTEM'}/DEBUG]: ${toLog}`;
		console.debug(log);
	}
}

module.exports = Logger;