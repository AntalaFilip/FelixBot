const EduBase = require("./edubase");

class EduCard extends EduBase {
	constructor({ id, lessonid, period, days, weeks, classroomids }) {
		super({ id });
		/** @type {string} */
		this.lessonid = lessonid;
		/** @type {string} */
		this.periodid = period;
		/** @type {string} */
		this.rawdays = days;
		/** @type {string} */
		this.rawweeks = weeks;
		/** @type {string[]} */
		this.classroomids = classroomids;
	}

	get lesson() {
		return this.manager.lessons.find(l => l.id === this.lessonid);
	}

	get period() {
		return this.manager.periods.find(p => p.id === this.periodid);
	}

	get days() {
		return this.manager.daydefs.filter(dd => dd.matches(this.rawdays)).map(dd => dd.day).filter(o => o);
	}

	get weeks() {
		return this.manager.weekdefs.filter(wd => wd.matches(this.rawweeks)).map(wd => wd.week).filter(o => o);
	}

	get classrooms() {
		return this.manager.classrooms.filter(c => this.classroomids.includes(c.id));
	}
}

module.exports = EduCard;