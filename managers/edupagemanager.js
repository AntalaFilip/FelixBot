const { default: axios } = require("axios");
const { DateTime } = require('luxon');
const FelixBotClient = require("../client");
const config = require('../config.json');
const EduCard = require("../types/edu/educard");
const EduClass = require("../types/edu/educlass");
const EduClassroom = require("../types/edu/educlassroom");
const EduDay = require("../types/edu/eduday");
const EduDayDef = require("../types/edu/edudaydef");
const EduGroup = require("../types/edu/edugroup");
const EduLesson = require("../types/edu/edulesson");
const EduPeriod = require("../types/edu/eduperiod");
const EduStudent = require("../types/edu/edustudent");
const EduSubject = require("../types/edu/edusubject");
const EduTeacher = require("../types/edu/eduteacher");
const EduTerm = require("../types/edu/eduterm");
const EduTermDef = require("../types/edu/edutermdef");
const EduWeek = require("../types/edu/eduweek");
const EduWeekDef = require("../types/edu/eduweekdef");
const Logger = require("../util/logger");
const { getSchoolYear } = require("../util/timeutils");


class EduPageManager {
	/**
	 * @param {FelixBotClient} client
	 */
	constructor(client) {
		const now = Date.now();
		this.client = client;
		this.guild = this.client.guilds.resolve(config.guild);
		this.logger = new Logger('EduPageManager');

		this.raw = [];

		/** @type {EduWeek[]} */
		this.weeks = [];
		/** @type {EduWeekDef[]} */
		this.weekdefs = [];
		/** @type {EduDay[]} */
		this.days = [];
		/** @type {EduDayDef[]} */
		this.daydefs = [];
		/** @type {EduTerm[]} */
		this.terms = [];
		/** @type {EduTermDef[]} */
		this.termdefs = [];
		/** @type {EduPeriod[]} */
		this.periods = [];
		/** @type {EduSubject[]} */
		this.subjects = [];
		/** @type {EduClassroom[]} */
		this.classrooms = [];
		/** @type {EduTeacher[]} */
		this.teachers = [];
		/** @type {EduClass[]} */
		this.classes = [];
		/** @type {EduGroup[]} */
		this.groups = [];
		/** @type {EduStudent[]} */
		this.students = [];
		/** @type {EduLesson[]} */
		this.lessons = [];
		/** @type {EduCard[]} */
		this.cards = [];

		this.ready = new Promise((resolve, reject) => {
			this.loadEduPageData()
				.then(c => {
					const time = Date.now() - now;
					this.logger.info(`Ready; fetched ${c} items in ${time}ms`);
					resolve(time);
				})
				.catch(err => {
					this.logger.error('FATAL: EduPageManager failed to load');
					reject(err);
					throw new Error('EduPageManager failed to load!');
				});
		});
	}

	async loadEduPageData() {
		const settings = await this.client.databaseManager.getSettings(config.guild);
		const { y1 } = getSchoolYear();
		const ttdata = await axios.post(`https://${settings.edupage}.edupage.org/timetable/server/ttviewer.js?__func=getTTViewerData`, { "__args": [null, y1], "__gsh": "00000000" });
		const currentttid = ttdata.data.r.regular.default_num || config.timetableFallback;
		/** @type {{tt_num: string, year: number, text: string, datefrom: string, hidden: boolean}} */
		const currenttt = ttdata.data.r.regular.timetables.find(tt => tt.tt_num === currentttid);
		const timetable = await axios.post(`https://${settings.edupage}.edupage.org/timetable/server/regulartt.js?__func=regularttGetData`, { "__args": [null, currentttid], "__gsh": "00000000" });
		const eduData = timetable.data;
		const edupageDBI = eduData.r.dbiAccessorRes;
		const tables = edupageDBI.tables;
		this.raw = tables;
		this.currenttt = currenttt;

		let count = 0;

		count += await this.loadWeeksFromTables(tables.find(t => t.id === 'weeks'));
		count += await this.loadWeekDefsFromTables(tables.find(t => t.id === 'weeksdefs'));
		count += await this.loadDaysFromTables(tables.find(t => t.id === 'days'));
		count += await this.loadDayDefsFromTables(tables.find(t => t.id === 'daysdefs'));
		count += await this.loadTermsFromTables(tables.find(t => t.id === 'terms'));
		count += await this.loadTermDefsFromTables(tables.find(t => t.id === 'termsdefs'));
		count += await this.loadPeriodsFromTables(tables.find(t => t.id === 'periods'));
		count += await this.loadSubjectsFromTables(tables.find(t => t.id === 'subjects'));
		count += await this.loadClassroomsFromTables(tables.find(t => t.id === 'classrooms'));
		count += await this.loadTeachersFromTables(tables.find(t => t.id === 'teachers'));
		count += await this.loadClassesFromTables(tables.find(t => t.id === 'classes'));
		count += await this.loadGroupsFromTables(tables.find(t => t.id === 'groups'));
		count += await this.loadStudentsFromTables(tables.find(t => t.id === 'students'));
		count += await this.loadLessonsFromTables(tables.find(t => t.id === 'lessons'));
		count += await this.loadCardsFromTables(tables.find(t => t.id === 'cards'));
		return count;
	}

	loadWeeksFromTables(weeks) {
		/** @type {[]} */
		const data = weeks.data_rows;
		const mapped = data.map(week => {
			const w = new EduWeek(week);
			return w;
		});
		this.weeks = mapped;
		return mapped.length;
	}

	loadWeekDefsFromTables(weekdefs) {
		/** @type {[]} */
		const data = weekdefs.data_rows;
		const mapped = data.map(weekdef => {
			const wd = new EduWeekDef(weekdef);
			return wd;
		});
		this.weekdefs = mapped;
		return mapped.length;
	}

	loadDaysFromTables(days) {
		/** @type {[]} */
		const data = days.data_rows;
		const mapped = data.map(day => {
			const d = new EduDay(day);
			return d;
		});
		this.days = mapped;
		return mapped.length;
	}

	loadDayDefsFromTables(daydefs) {
		/** @type {[]} */
		const data = daydefs.data_rows;
		const mapped = data.map(daydef => {
			const dd = new EduDayDef(daydef);
			return dd;
		});
		this.daydefs = mapped;
		return mapped.length;
	}

	loadTermsFromTables(terms) {
		/** @type {[]} */
		const data = terms.data_rows;
		const mapped = data.map(term => {
			const t = new EduTerm(term);
			return t;
		});
		this.terms = mapped;
		return mapped.length;
	}

	loadTermDefsFromTables(termdefs) {
		/** @type {[]} */
		const data = termdefs.data_rows;
		const mapped = data.map(termdef => {
			const td = new EduTermDef(termdef);
			return td;
		});
		this.termdefs = mapped;
		return mapped.length;
	}

	loadPeriodsFromTables(periods) {
		/** @type {[]} */
		const data = periods.data_rows;
		const mapped = data.map(period => {
			const p = new EduPeriod(period);
			return p;
		});
		this.periods = mapped;
		return mapped.length;
	}

	loadSubjectsFromTables(subjects) {
		/** @type {[]} */
		const data = subjects.data_rows;
		const exc = config.subjectExceptions;
		const filtered = data.filter(s => this.guild.roles.cache.find(r => r.name === s.short) || this.guild.roles.resolve(exc[s.short]) || exc[s.short]);
		const mapped = filtered.map(subject => {
			const s = new EduSubject(subject);
			return s;
		});
		this.subjects = mapped;
		return mapped.length;
	}

	loadClassroomsFromTables(classrooms) {
		/** @type {[]} */
		const data = classrooms.data_rows;
		const mapped = data.map(classroom => {
			const c = new EduClassroom(classroom);
			return c;
		});
		this.classrooms = mapped;
		return mapped.length;
	}

	async loadTeachersFromTables(teachers) {
		const DB = this.client.databaseManager;
		const data = teachers.data_rows;
		const prom = data.map(async teacher => {
			const dbt = await DB.getTeacher(null, Number(teacher.id));
			teacher.member = dbt && dbt.member;
			const t = new EduTeacher(teacher);
			return t;
		});
		const mapped = await Promise.all(prom);
		this.teachers = mapped;
		return mapped.length;
	}

	loadClassesFromTables(classes) {
		/** @type {[]} */
		const data = classes.data_rows;
		const mapped = data.map(cls => {
			const dsrole = this.guild.roles.cache.find(r => r.name.toLowerCase() === cls.name.toLowerCase());
			if (!dsrole) return;
			cls.role = dsrole;
			const c = new EduClass(cls);
			return c;
		}).filter(o => o);
		this.classes = mapped;
		return mapped.length;
	}

	loadGroupsFromTables(groups) {
		/** @type {[]} */
		const data = groups.data_rows;
		const mapped = data.map(group => {
			const g = new EduGroup(group);
			return g;
		});
		this.groups = mapped;
		return mapped.length;
	}

	async loadStudentsFromTables(students) {
		const DB = this.client.databaseManager;
		/** @type {[]} */
		const data = students.data_rows;
		const prom = data.map(async student => {
			const cls = this.classes.find(c => c.id === student.classid);
			if (!cls) return;
			const dbs = await DB.getMember(null, student.id);
			student.member = dbs && dbs.member;
			const s = new EduStudent(student);
			return s;
		});
		const mapped = (await Promise.all(prom)).filter(o => o);
		this.students = mapped;
		return mapped.length;
	}

	async loadLessonsFromTables(lessons) {
		/** @type {[]} */
		const data = lessons.data_rows;
		const mapped = data.map(lesson => {
			const subject = this.subjects.find(s => s.id === lesson.subjectid);
			const cls = this.classes.find(c => lesson.classids.includes(c.id));
			if (!subject || !cls) return;
			const l = new EduLesson(lesson);
			return l;
		}).filter(o => o);
		this.lessons = mapped;
		return mapped.length;
	}

	loadCardsFromTables(cards) {
		/** @type {[]} */
		const data = cards.data_rows;
		const mapped = data.map(card => {
			const lesson = this.lessons.find(l => l.id === card.lessonid);
			const period = this.periods.find(p => p.id === card.period);
			if (!lesson || !period) return;
			const c = new EduCard(card);
			return c;
		}).filter(o => o);
		this.cards = mapped;
		return mapped.length;
	}

	get currentWeek() {
		const tt = this.currenttt;
		const from = DateTime.fromISO(tt.datefrom);
		const ttweek = from.weekNumber;
		const now = DateTime.now();
		const nowweek = now.weekNumber;
		const weeks = this.weeks.length;
		const i = ttweek % weeks;
		const curr = nowweek % weeks;
		let ii = i + curr;
		if (ii > weeks) ii -= weeks;
		const week = this.weeks.find(w => w.id == ii);
		return week;
	}
}

module.exports = EduPageManager;