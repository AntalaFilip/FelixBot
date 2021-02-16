const TimeUtils = {
	/**
	 * @returns {number | null} returns a number representing a period
	 */
	getCurrentPeriod() {
		const date = new Date();

		if (date.getUTCHours() < 7 || date.getHours() > 13) return null;

		return date.getHours() - 7;
	},

	lessonShouldEnd() {
		const date = new Date();

		if (date.getMinutes() >= 45) return true;

		return false;
	},
};

module.exports = TimeUtils;