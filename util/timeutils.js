const Logger = require("./logger");

class TimeUtils {
	constructor(client) {
		this.client = client;
		this.logger = new Logger("TimeUtils");
	}
	/**
	 * @returns {number} returns a number representing a period
	 */
	getCurrentPeriod() {
		const date = new Date();

		if (date.getHours() <= 8 || date.getHours() >= 13) return 0;

		return date.getHours() - 8;
	}

	lessonShouldEnd() {
		const date = new Date();

		if (date.getMinutes() >= 45) return true;

		return false;
	}
}

module.exports = TimeUtils;