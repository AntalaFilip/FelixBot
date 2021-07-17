const { default: axios } = require("axios");
const FelixBotClient = require("../client");
const config = require('../config.json');

class EduPageManager {
	/**
	 * @param {FelixBotClient} client
	 */
	constructor(client) {
		this.client = client;


	}

	async loadEduPageData() {
		const settings = await this.client.databaseManager.getSettings(config.guild);
		const res = await axios.post(`${settings.edupage}.edupage.org/timetable/server/regulartt.js?__func=regularttGetData`, { "__args": [null, "150"], "__gsh": "00000000" });
		const eduData = res.data;
		const edupageDBI = eduData.r.dbiAccessorRes;
		const tables = edupageDBI.tables;

		const weeks = tables.find(t => t.id === 'weeks');
		const days = tables.find(t => t.id === 'days');
	}

	loadWeeksFromTables(weeks) {
		const data = weeks.data_rows;
		this.weeks = data;
	}

	loadDaysFromTables(days) {
		const data = days.data_rows;
		this.days = data;
	}

	loadClassroomsFromTables(classrooms) {
		const data = classrooms.data_rows;
		this.classrooms = data;
	}

	loadTeachersFromTables(teachers) {
		const data = teachers.data_rows;
	}

	loadClassesFromTables(classes) {
		/** @type {[]} */
		const data = classes.data_rows;
		const mapped = data.forEach(cls => {

		});
	}

	async loadPeriodsFromTables() {

	}
}