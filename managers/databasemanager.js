const { GuildMember, Guild, Role } = require('discord.js');
const { default: knex } = require('knex');
const FelixBotClient = require('../client');
const Audit = require('../types/audit/audit');
const MergeAudit = require('../types/audit/mergeaudit');
const SplitAudit = require('../types/audit/splitaudit');
const EduStudent = require('../types/edu/edustudent');
const EduTeacher = require('../types/edu/eduteacher');
const Lesson = require('../types/lesson/lesson');
const Logger = require('../util/logger');
const Parsers = require('../util/parsers');
const str = require('../util/stringutils');
const config = require('../config.json');
require('dotenv').config();

class DatabaseManager {
	/**
	 * Creates a new DatabaseManager.
	 * @param {FelixBotClient} client The client that instantiated this.
	 */
	constructor(client) {
		this.client = client;
		this.logger = new Logger("DatabaseManager");
		this.logger.log(`Ready!`);

		this.knex = knex({
			connection: {
				host: process.env.DBHOST,
				port: process.env.DBPORT || null,
				database: process.env.DB,
				user: process.env.DBUSER,
				password: process.env.DBPASS,
			},
			client: `mysql`,
		});
	}

	/**
	 * @param {Object} data
	 * @param {GuildMember} [data.member]
	 * @param {EduTeacher} [data.eusr]
	 * @param {string} [data.email]
	 * @param {boolean} [data.autolessons]
	 * @param {import('../util/parsers').VerificationLevel} [data.verification]
	 * @returns
	 */
	async insertTeacher(data) {
		const query = this.knex
			.insert({
				dsid: data.member.id,
				eduid: Number(data.eusr.id),
				manager: data.eusr.manager.id,
				name: data.member.displayName,
				email: data.email,
				autolessons: data.autolessons ?? 1,
			})
			.into('teachers');

		const res = await query;
		return res[0];
	}

	async getTeacher(id, eduid) {
		const query = this.knex
			.select('*')
			.from('teachers');

		if (id) query.where({ dsid: id });
		if (eduid) query.where({ eduid });

		const res = await query;
		const data = Parsers.parseTeacher(res);

		if ((id && !Array.isArray(id)) || (eduid && !Array.isArray(eduid))) return data[0];
		return data;
	}

	/**
	 * @param {Object} data
	 * @param {GuildMember} [data.member]
	 * @param {EduTeacher} [data.eusr]
	 * @param {string} [data.email]
	 * @param {boolean} [data.autolessons]
	 * @param {import('../util/parsers').VerificationLevel} [data.verification]
	 * @returns
	 */
	async updateTeacher(id, data) {
		const query = this.knex
			.table('teachers')
			.update(data)
			.where({ dsid: id });

		await query;
		return;
	}

	async insertRole(data) {
		const query = this.knex
			.insert({
				roleid: data.role.id,
				eduid: data.eduid,
				name: data.role.name,
			})
			.into('roles');

		const res = await query;
		return res[0];
	}

	/**
	 * @param {Object} data
	 * @param {GuildMember} [data.member]
	 * @param {EduStudent} [data.eusr]
	 * @param {Role} [data.role]
	 * @param {import('../util/parsers').VerificationLevel} [data.verification]
	 * @returns
	 */
	async insertMember(data) {
		const query = this.knex
			.insert({
				dsid: data.member.id,
				eduid: (data.eusr && Number(data.eusr.id)) ?? null,
				manager: (data.eusr && data.eusr.manager.id) ?? null,
				name: data.member.displayName,
				verification: data.verification,
				role: data.role.id,
			})
			.into('members');

		const res = await query;
		return res[0];
	}

	async getMember(id, eduid) {
		const query = this.knex
			.select('*')
			.from('members');

		if (id) query.where({ dsid: id });
		if (eduid) query.where({ eduid });

		const res = await query;
		const data = Parsers.parseMember(res);

		if ((id && !Array.isArray(id)) || (eduid && !Array.isArray(eduid))) return data[0];
		return data;
	}

	/**
	 * @param {import('discord.js').Snowflake} id
	 * @param {Object} data
	 * @param {GuildMember} [data.member]
	 * @param {EduStudent} [data.eusr]
	 * @param {Role} [data.role]
	 * @param {string} [data.name]
	 * @param {import('../util/parsers').VerificationLevel} [data.verification]
	 * @returns
	 */
	async updateMember(id, data) {
		const query = this.knex
			.table('members')
			.update(data)
			.where({ dsid: id });

		await query;
		return;
	}

	/**
	 * Parses a result from the database
	 * @param {[]} result The string to parse
	 * @returns {[] | {}}
	 */
	parseDatabaseResult(result) {
		if (!Array.isArray(result)) result = [result];
		const mapped = result.map(r => {
			const parsed = new Map();
			const res = new Map(Object.entries(r));
			res.forEach((val, key) => {
				try {
					const newval = JSON.parse(val);
					parsed.set(key, newval);
				}
				catch (error) {
					parsed.set(key, val);
				}
			});
			return Object.fromEntries(parsed);
		});

		if (mapped.length === 1) return mapped[0];
		return mapped;
	}

	/**
	 * Fetches all ongoing lessons in the database, parses them into Lesson objects, and returns them as an array.
	 * @param {Guild} guild
	 * @returns {Promise<Lesson[]>} Promise with an array of Lesson objects, or an empty array, if no lessons are ongoing.
	 */
	async getOngoingLessons(guild) {
		const query = this.knex
			.select(
				'*',
			)
			.from('lessons AS l')
			.where('l.endedat', null);

		const res = await query;
		if (res.length === 0) return [];

		const data = this.parseDatabaseResult(res);
		const lessons = data.map(val => (
			new Lesson(val.id, val.allocated, guild.members.cache.find(t => t.id == val.teacher), val.lesson, val.classname.slice(0, 2), val.group, val.period, val.students, val.startedat, null)
		));

		return lessons;
	}

	async getAllLessons(guild = this.client.guilds.cache.find(g => g.id == `702836521622962198`)) {
		const query = this.knex
			.select(
				'*',
			)
			.from('lessons AS l');

		const res = await query;
		if (res.length === 0) return [];

		const data = this.parseDatabaseResult(res);
		/** @type {Lesson[]} */
		const lessons = data.map(val => {
			const teacher = guild.members.cache.find(t => t.id == val.teacher);
			if (!teacher) {
				this.logger.warn(`Lesson ${val.id} has no corresponding teacher (${val.teacher}) in the guild!`);
				return;
			}
			const ls = new Lesson(
				val.id,
				val.allocated,
				teacher,
				val.lesson, val.classname.slice(0, 2),
				val.group,
				val.period,
				val.students,
				val.startedat,
				val.endedat ? new Date(val.endedat) : null,
			);
			return ls;
		});
		const filtered = lessons.filter(l => l instanceof Lesson);
		return filtered;
	}

	/**
	 * @param {Guild} guild
	 * @param {number} id
	 */
	async getLesson(guild = this.client.guilds.resolve(config.guild), id) {
		const query = this.knex
			.select(
				'*',
			)
			.from('lessons AS l')
			.where({ id });

		const res = await query;
		if (res.length === 0) return null;

		const data = this.parseDatabaseResult(res[0]);
		const ls = new Lesson(data.id, data.allocated, guild.members.cache.find(t => t.id == data.teacher), data.lesson, data.classname.slice(0, 2), data.group, data.period, data.students, new Date(data.startedat), new Date(data.endedat));
		return ls;
	}

	/**
	 * @param {Guild} guild
	 * @returns
	 */
	async getAllUsers(guild = this.client.guilds.cache.find(g => g.id == `702836521622962198`)) {
		const query = this.knex
			.select(
				'*',
			)
			.from('teachers AS t');

		const res = await query;
		if (res.length === 0) return null;

		const data = this.parseDatabaseResult(res);
		const users = data.map(u => ({
			member: guild.members.resolve(String(u.dsid)),
			autolessons: Boolean(u.autolessons),
			eduid: String(u.eduid),
		}));
		return users;
	}

	async getUser(guild = this.client.guilds.cache.find(g => g.id == `702836521622962198`), id) {
		const query = this.knex
			.select(
				'*',
			)
			.from('teachers AS t')
			.where({ id });

		const res = await query;
		const data = this.parseDatabaseResult(res[0]);
		const user = {
			member: guild.members.resolve(String(data.dsid)),
			autolessons: Boolean(data.autolessons),
			eduid: String(data.eduid),
		};
		return user;
	}

	async insertUser(data) {
		const query = this.knex
			.insert(data)
			.into('users');

		const res = await query;
		return res[0];
	}


	/**
	 * Gets the guild's settings
	 * @param {bigint} id
	 */
	async getSettings(id = 702836521622962198n) {
		const query = this.knex
			.select(
				'*',
			)
			.from('guilds AS g')
			.where({ id });
		const res = await query;
		const data = this.parseDatabaseResult(res[0]);
		return data;
	}

	/**
	 * Syncs the Lesson with the database.
	 * @param {Lesson} lesson The Lesson to sync.
	 */
	async updateLesson(lesson) {
		this.client.isDev() && this.logger.debug(`Updating lesson: ${lesson.id}`);
		const allocids = lesson.allocated.map(c => c.id);
		const jsonids = JSON.stringify(allocids);
		const students = JSON.stringify(lesson.students);
		const query = this.knex
			.table('lessons')
			.update({ students, allocated: jsonids })
			.where({ id: lesson.id });

		await query;
		return;
	}

	/**
	 * Executes an update query for endedAt which essentially ends the lesson in the database.
	 * @param {Lesson} lesson The lesson that should be ended.
	 */
	async endLesson(lesson) {
		this.client.isDev() && this.logger.debug(`Ending lesson: ${lesson.id}`);
		await this.updateLesson(lesson);
		const query = this.knex
			.table('lessons')
			.update({ endedat: str.dateToString(lesson.endedAt) })
			.where({ id: lesson.id });

		await query;
		return;
	}

	/**
	 * Pushes a new Lesson to the database.
	 * @param {Lesson} lesson The Lesson that should get pushed to the database.
	 * @returns Promise with the numeric ID of the Lesson, generated by the database.
	 */
	async pushNewLesson(lesson) {
		this.client.isDev() && this.logger.debug(`Inserting new lesson: ${lesson.lessonid + '@' + lesson.classid}`);
		const classname = await str.resolveClass(lesson.classid);
		const studentJson = JSON.stringify(lesson.students);
		const allocated = lesson.allocated.map(c => c.id);
		const allocJson = JSON.stringify(allocated);
		const query = this.knex
			.insert({
				teacher: lesson.teacher.member.id,
				lesson: lesson.lessonid,
				classname,
				group: lesson.group,
				period: lesson.period,
				startedat: str.dateToString(lesson.startedAt),
				allocated: allocJson,
				students: studentJson,
			})
			.into('users');

		const res = await query;
		return res[0];
	}

	/**
	 * Inserts an audit event to the Database
	 * @param {'merge' | 'split' | 'general'} action The identificator of the event
	 * @param {GuildMember} member The member executing the event
	 * @param {string} eventdata The JSONified event data
	 * @param {Date?} timestamp
	 * @returns {Promise<number>}
	 */
	async insertAudit(action, member, eventdata, timestamp = null) {
		this.client.isDev() && this.logger.debug(`Inserting new audit event: ${action}`);
		const query = this.knex
			.insert({
				user: member.id,
				guild: member.guild.id,
				action,
				data: eventdata,
				timestamp: timestamp ? str.dateToString(timestamp) : 'CURRENT_TIMESTAMP',
			})
			.into('audits');

		const res = await query;
		return res[0];
	}

	async getAllAudits() {
		this.client.isDev() && this.logger.debug(`Fetching audits from database`);
		const query = this.knex
			.select('*')
			.from('audits');

		const res = await query;
		const data = res.map(raw => {
			const parsed = this.parseDatabaseResult(raw);
			const user = this.client.guilds.cache.find(g => g.id == parsed.guild).members.cache.find(u => u.id == parsed.user);
			if (!user) return;
			let to;
			let from;
			let audit;
			switch (parsed.action) {
				case 'merge':
					from = [];
					parsed.data.from.forEach(id => from.push(user.guild.channels.resolve(id)));
					to = user.guild.channels.resolve(parsed.data.to);
					audit = new MergeAudit(user, to, from, parsed.data.list, parsed.timestamp, parsed.id);
					break;
				case 'split':
					to = [];
					parsed.data.to.forEach(id => to.push(user.guild.channels.resolve(id)));
					from = user.guild.channels.resolve(parsed.data.from);
					audit = new SplitAudit(user, from, to, parsed.data.list, parsed.timestamp, parsed.id);
					break;
				default:
					audit = new Audit(user, parsed.data, parsed.timestamp, parsed.id);
			}
			return audit;
		});
		return data;
	}
}

module.exports = DatabaseManager;
exports.db = knex;