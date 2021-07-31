const { default: axios } = require("axios");
const FelixBotClient = require("../client");
const config = require('../config.json');
const EduClass = require("../types/edu/educlass");
const EduClassroom = require("../types/edu/educlassroom");
const EduDay = require("../types/edu/eduday");
const EduGroup = require("../types/edu/edugroup");
const EduLesson = require("../types/edu/edulesson");
const EduPeriod = require("../types/edu/eduperiod");
const EduStudent = require("../types/edu/edustudent");
const EduSubject = require("../types/edu/edusubject");
const EduTeacher = require("../types/edu/eduteacher");
const EduWeek = require("../types/edu/eduweek");
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
		/** @type {EduDay[]} */
		this.days = [];
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

		this.ready = new Promise((resolve) => {
			this.loadEduPageData()
				.then(c => {
					this.logger.info(`Ready; fetched ${c} items`);
					resolve(Date.now() - now);
				});
		});
	}

	async loadEduPageData() {
		const settings = await this.client.databaseManager.getSettings(config.guild);
		const { y1 } = getSchoolYear();
		const ttdata = await axios.post(`https://${settings.edupage}.edupage.org/timetable/server/ttviewer.js?__func=getTTViewerData`, { "__args": [null, y1], "__gsh": "00000000" });
		const currentttid = ttdata.data.r.regular.default_num || '150';
		const currenttt = ttdata.data.r.regular.timetables.find(tt => tt.tt_num === currentttid);
		const timetable = await axios.post(`https://${settings.edupage}.edupage.org/timetable/server/regulartt.js?__func=regularttGetData`, { "__args": [null, currentttid], "__gsh": "00000000" });
		const eduData = timetable.data;
		const edupageDBI = eduData.r.dbiAccessorRes;
		const tables = edupageDBI.tables;
		this.raw = tables;
		this.currenttt = currenttt;

		let count = 0;

		count += await this.loadWeeksFromTables(tables.find(t => t.id === 'weeks'));
		count += await this.loadDaysFromTables(tables.find(t => t.id === 'days'));
		count += await this.loadPeriodsFromTables(tables.find(t => t.id === 'periods'));
		count += await this.loadSubjectsFromTables(tables.find(t => t.id === 'subjects'));
		count += await this.loadClassroomsFromTables(tables.find(t => t.id === 'classrooms'));
		count += await this.loadTeachersFromTables(tables.find(t => t.id === 'teachers'));
		count += await this.loadClassesFromTables(tables.find(t => t.id === 'classes'));
		count += await this.loadGroupsFromTables(tables.find(t => t.id === 'groups'));
		count += await this.loadStudentsFromTables(tables.find(t => t.id === 'students'));
		count += await this.loadLessonsFromTables(tables.find(t => t.id === 'lessons'));
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
		const filtered = data.filter(s => this.guild.roles.cache.find(r => r.name === s.short));
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

	loadStudentsFromTables(students) {
		/** @type {[]} */
		const data = students.data_rows;
		const mapped = data.map(student => {
			const cls = this.classes.find(c => c.id === student.classid);
			if (!cls) return;
			const s = new EduStudent(student);
			return s;
		}).filter(o => o);
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
}

module.exports = EduPageManager;