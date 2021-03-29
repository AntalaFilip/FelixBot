const TimeUtils = {
	/**
	 * @returns {number | null} returns a number representing a period
	 */
	getCurrentPeriod() {
		const date = new Date();

		if (date.getUTCHours() < 7 || date.getUTCHours() > 13) return null;
		if (date.getUTCMinutes() > 45) return null;

		return date.getUTCHours() - 6;
	},

	lessonShouldEnd() {
		const date = new Date();

		if (date.getUTCMinutes() >= 45) return true;

		return false;
	},
};

module.exports = TimeUtils;