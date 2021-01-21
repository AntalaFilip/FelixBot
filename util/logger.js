class Logger {
	constructor(instance) {
		this.instance = instance;
	}

	log(toLog) {
		const log = `[${new Date().toTimeString()}] [${this.instance || 'SYSTEM'}/INFO]: ${toLog}`;
		console.log(log);
	}

	info(toLog) {
		const log = `[${new Date().toTimeString()}] [${this.instance || 'SYSTEM'}/INFO]: ${toLog}`;
		console.info(log);
	}

	warn(toLog) {
		const log = `[${new Date().toTimeString()}] [${this.instance || 'SYSTEM'}/WARN]: ${toLog}`;
		console.warn(log);
	}

	error(toLog) {
		const log = `[${new Date().toTimeString()}] [${this.instance || 'SYSTEM'}/ERROR]: ${toLog}`;
		console.error(log);
	}

	debug(toLog) {
		const log = `[${new Date().toTimeString()}] [${this.instance || 'SYSTEM'}/DEBUG]: ${toLog}`;
		console.debug(log);
	}
}

module.exports = Logger;