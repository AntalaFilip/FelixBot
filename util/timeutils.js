const TimeUtils = {
	/**
	 * @returns {number | null} returns a number representing a period
	 */
	getCurrentPeriod() {
		const date = new Date();

		if (date.getHours() <= 8 || date.getHours() >= 14) return null;

		return date.getHours() - 8;
	},

	lessonShouldEnd() {
		const date = new Date();

		if (date.getMinutes() >= 45) return true;

		return false;
	},
};

module.exports = TimeUtils;