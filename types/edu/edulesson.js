const EduBase = require("./edubase");
const EduTerm = require("./eduterm");

class EduLesson extends EduBase {
	constructor({
		id, subjectid, teacherids, groupids, classids,
		count, durationperiods, classroomidss, termsdefid, weeksdefid,
		daysdefid, terms, seminargroup, bell, studentids,
	}, mgr) {
		super({ id }, mgr);
		/** @type {string} */
		this.subjectid = subjectid;
		/** @type {string[]} */
		this.teacherids = teacherids;
		/** @type {string[]} */
		this.groupids = groupids;
		/** @type {string[]} */
		this.classids = classids;
		/** @type {number} */
		this.count = count;
		/** @type {number} */
		this.durationperiods = durationperiods;
		/** @type {string[]} */
		this.classroomids = classroomidss[0];
		this.defids = {
			/** @type {string} */
			terms: termsdefid,
			/** @type {string} */
			weeks: weeksdefid,
			/** @type {string} */
			days: daysdefid,
		};
		/** @type {string} */
		this.rawterms = terms;
		/** @type {string} */
		this.seminargroup = seminargroup;
		/** @type {string} */
		this.bell = bell;
		/** @type {string[]} */
		this.studentids = studentids;
	}

	get subject() {
		return this.manager.subjects.find(s => s.id === this.subjectid);
	}

	get teachers() {
		return this.manager.teachers.filter(t => this.teacherids.includes(t.id));
	}

	get groups() {
		return this.manager.groups.filter(g => this.groupids.includes(g.id));
	}

	get classes() {
		return this.manager.classes.filter(c => this.classids.includes(c.id));
	}

	get classrooms() {
		return this.manager.classrooms.filter(c => this.classroomids.includes(c.id));
	}

	get students() {
		return this.manager.students.filter(s => this.studentids.includes(s.id));
	}

	get cards() {
		return this.manager.cards.filter(c => c.lessonid === this.id);
	}

	/** @returns {EduTerm[]} */
	get terms() {
		return this.manager.termdefs.filter(td => td.matches(this.terms)).map(td => td.term).filter(o => o);
	}
}

module.exports = EduLesson;