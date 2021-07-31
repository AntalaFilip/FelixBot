const EduPageManager = require("../managers/edupagemanager");

const TimeUtils = {
	/**
	 * @returns {number | null} returns a number representing a period
	 */
	getCurrentPeriod() {
		const date = new Date();
		/** @type {EduPageManager} */
		const EDU = global.client.edupageManager;


		if (date.getUTCHours() < 7 || date.getUTCHours() > 13) return null;
		if (date.getUTCMinutes() > 45) return null;

		return date.getUTCHours() - 6;
	},

	/**
	 * @param {number} num
	 */
	twoDigit(num) {
		const string = num.toString();
		if (string.length === 1) {
			return Number('0' + string);
		}
		return string;
	},

	timeToEduString({ date, time }) {
		if (date) {
			return `${this.twoDigit(date.getHours())}:${this.twoDigit(date.getMinutes())}`;
		}
		else {
			const str = String(time);

		}
	},

	stringToTime(string) {

	},

	lessonShouldEnd() {
		const date = new Date();

		if (date.getUTCMinutes() >= 45) return true;

		return false;
	},

	/**
	 * @param {Date} date
	 */
	getSchoolYear(date) {
		if (!date) date = new Date();

		const year = date.getFullYear();
		const month = date.getMonth() + 1;
		let y1 = year;
		if (month < 9) y1--;
		const y2 = y1++;

		return {
			y1,
			y2,
			literal: `${y1}/${y2}`,
		};
	},
};

module.exports = TimeUtils;