const { default: axios } = require("axios");
const FelixBotClient = require("../client");
const config = require('../config.json');
const Logger = require("../util/logger");

/**
 * @typedef EduTeacher
 * @property {string} id 5 digit identificator
 * @property {string} short User's initials, surname first
 * @property {"F" | "M" | ""} gender
 * @property {string} bell
 * @property {string} color HEX color with #
 */

/**
 * @typedef EduClassroom
 * @property {string} id 5 digit identificator
 * @property {string} name
 * @property {string} short
 * @property {boolean} needssupervision
 * @property {boolean} sharedroom
 * @property {string} color HEX color with #
 */

/**
 * @typedef EduClass
 * @property {string} id 5 digit identificator
 * @property {string} name
 * @property {string} short
 * @property {string} teacherid
 * @property {EduTeacher} teacher
 * @property {string} classroomid
 * @property {EduClassroom} classroom
 * @property {string} bell
 * @property {string} color HEX color with #
 */

/**
 * @typedef EduGroup
 * @property {string} id *num ID
 * @property {string} name
 * @property {string} classid
 * @property {EduClass} class
 * @property {boolean} entireclass
 * @property {string} divisionid
 * // TODO divisions
 * @property {string} color HEX color with #
 */

/**
 * @typedef EduStudent
 * @property {string} id 5 digit identificator
 * @property {string} short User's initials, surname first
 * @property {string} classid
 * @property {EduClass} class
 * @property {string[]} groupids
 * @property {EduGroup[]} groups
 */

class EduPageManager {
	/**
	 * @param {FelixBotClient} client
	 */
	constructor(client) {
		this.client = client;
		this.guild = this.client.guilds.resolve(config.guild);
		this.logger = new Logger('EduPageManager');

		this.raw = [];

		this.weeks = [];
		this.days = [];
		this.periods = [];
		this.subjects = [];
		this.classrooms = [];
		/** @type {EduTeacher[]} */
		this.teachers = [];
		/** @type {EduClass[]} */
		this.classes = [];
		/** @type {EduGroup[]} */
		this.groups = [];
		/** @type {EduStudent[]} */
		this.students = [];
		this.lessons = [];

		this.loadEduPageData()
			.then((c) => this.logger.info(`Ready; fetched ${c} items`));
	}

	async loadEduPageData() {
		const settings = await this.client.databaseManager.getSettings(config.guild);
		const res = await axios.post(`https://${settings.edupage}.edupage.org/timetable/server/regulartt.js?__func=regularttGetData`, { "__args": [null, "150"], "__gsh": "00000000" });
		const eduData = res.data;
		const edupageDBI = eduData.r.dbiAccessorRes;
		const tables = edupageDBI.tables;
		this.raw = tables;

		let count = 0;

		count += await this.loadWeeksFromTables(tables.find(t => t.id === 'weeks'));
		count += await this.loadDaysFromTables(tables.find(t => t.id === 'days'));
		count += await this.loadPeriodsFromTables(tables.find(t => t.id === 'periods'));
		count += await this.loadClassroomsFromTables(tables.find(t => t.id === 'classrooms'));
		count += await this.loadTeachersFromTables(tables.find(t => t.id === 'teachers'));
		count += await this.loadClassesFromTables(tables.find(t => t.id === 'classes'));
		count += await this.loadGroupsFromTables(tables.find(t => t.id === 'groups'));
		count += await this.loadStudentsFromTables(tables.find(t => t.id === 'students'));
		count += await this.loadLessonsFromTables(tables.find(t => t.id === 'lessons'));
		return count;
	}

	loadWeeksFromTables(weeks) {
		const data = weeks.data_rows;
		this.weeks = data;
		return data.length;
	}

	loadDaysFromTables(days) {
		const data = days.data_rows;
		this.days = data;
		return data.length;
	}

	loadPeriodsFromTables(periods) {
		const data = periods.data_rows;
		this.periods = data;
		return data.length;
	}

	loadSubjectsFromTables(subjects) {
		const data = subjects.data_rows;
		const filtered = data.filter(s => this.guild.roles.cache.find(r => r.name === s.short));
		this.subjects = filtered;
		return filtered.length;
	}

	loadClassroomsFromTables(classrooms) {
		const data = classrooms.data_rows;
		this.classrooms = data;
		return data.length;
	}

	async loadTeachersFromTables(teachers) {
		const DB = this.client.databaseManager;
		const data = teachers.data_rows;
		const prom = data.map(async teacher => {
			const dbt = await DB.getTeacher(null, Number(teacher.id));
			teacher.ds = dbt && dbt.member;
			return teacher;
		});
		const mapped = await Promise.all(prom);
		this.teachers = mapped;
		return mapped.length;
	}

	loadClassesFromTables(classes) {
		/** @type {[]} */
		const data = classes.data_rows;
		const mapped = data.map(cls => {
			cls.classroom = this.classrooms.find(cr => cr.id === cls.classroomid);
			cls.teacher = this.teachers.find(t => t.id === cls.teacherid);
			const dsrole = this.guild.roles.cache.find(r => r.name.toLowerCase() === cls.name.toLowerCase());
			cls.role = dsrole;
			return cls.role && cls;
		}).filter(o => o);
		this.classes = mapped;
		return mapped.length;
	}

	loadGroupsFromTables(groups) {
		const data = groups.data_rows;
		const mapped = data.map(group => {
			group.class = this.classes.find(c => c.id === group.classid);
			return group;
		});
		this.groups = mapped;
		return mapped.length;
	}

	loadStudentsFromTables(students) {
		/** @type {[]} */
		const data = students.data_rows;
		const mapped = data.map(student => {
			student.class = this.classes.find(c => c.id === student.classid);
			student.groups = this.groups.filter(g => student.groupids.includes(g.id));
			return student.class && student;
		}).filter(o => o);
		this.students = mapped;
		return mapped.length;
	}

	async loadLessonsFromTables(lessons) {
		/** @type {[]} */
		const data = lessons.data_rows;
		const mapped = data.map(lesson => {
			lesson.subject = this.subjects.find(s => s.id === lesson.subjectid);
			if (!lesson.subject) return;
			lesson.teachers = this.teachers.filter(t => lesson.teacherids.includes(t.id));
			lesson.groups = this.groups.filter(g => lesson.groupids.includes(g.id));
			lesson.classes = this.classes.filter(c => lesson.classids.includes(c.id));
			lesson.students = this.students.filter(s => lesson.studentsids.includes(s.id));
			return lesson;
		}).filter(o => o);
		this.lessons = mapped;
		return mapped.length;
	}
}

module.exports = EduPageManager;