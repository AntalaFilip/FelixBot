const TimeUtils = {
	/**
	 * @returns {number | null} returns a number representing a period
	 */
	getCurrentPeriod() {
		const date = new Date();
		/** @type {import("../managers/edupagemanager")} */
		const EDU = global.client.edupageManager;
		const periods = EDU.periods;
		const eduTime = this.timeToEduString({ date });
		const eduNumTime = this.timeStringToTime(eduTime);
		const period = periods.find(p => {
			const start = this.timeStringToTime(p.starttime) < eduNumTime;
			const end = this.timeStringToTime(p.endtime) > eduNumTime;
			return start && end;
		});

		if (!period) return null;


		if (date.getUTCHours() < 7 || date.getUTCHours() > 13) return null;
		if (date.getUTCMinutes() > 45) return null;

		return date.getUTCHours() - 6;
	},

	/**
	 * @param {string | number} num
	 */
	twoDigit(num) {
		if (typeof num === 'string') {
			const strings = num.split(':');
			strings.forEach(s => {
				if (s.length % 2) {
					s = `0${s}`;
				}
			});
			return strings.join(':');
		}
		else if (typeof num === 'number') {
			let string = num.toString();
			if (string.length % 2) {
				string = `0${string}`;
			}
			return string;
		}
	},

	timeToEduString({ date, time }) {
		if (date) {
			return `${this.twoDigit(date.getHours())}:${this.twoDigit(date.getMinutes())}`;
		}
		else {
			const str = this.twoDigit(String(time));
			const hrs = str.substr(0, 2);
			const min = str.substr(2, 2);
			return `${hrs}:${min}`;
		}
	},

	/**
	 *
	 * @param {string} string
	 * @returns
	 */
	timeStringToTime(string) {
		return Number(string.replace(/:/g, ''));
	},

	timeStringToDate(string) {
		return new Date(new Date().toDateString() + ' ' + string);
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