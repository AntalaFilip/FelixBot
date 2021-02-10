const { CommandoClient } = require("discord.js-commando");
const { MessageEmbed, GuildMember, VoiceChannel, CategoryChannel } = require('discord.js');
const Logger = require("../util/logger");
const Lesson = require("../types/lesson/lesson");
const timetable = require("../timetable");
const reactions = require("../util/reactions");
const time = require('../util/timeutils');
const str = require('../util/stringutils');
const LessonParticipant = require("../types/lesson/lessonparticipant");
const LessonStudent = require("../types/lesson/lessonstudent");

class LessonManager {
	/**
	 * Creates a new LessonManager.
	 * @param {CommandoClient} client
	 */
	constructor(client) {
		this.client = client;
		this.logger = new Logger("LessonManager");
		this.lessons = null;
		this.ready = new Promise((resolve, reject) => {
			client.databaseManager.getOngoingLessons()
				.then(lss => {
					this.lessons = lss;
					this.logger.log(`Ready; there are ${this.lessons.length} lessons ongoing!`);
					resolve();
				}, err => {
					reject(err);
					this.logger.error(`FATAL: LessonManager failed to load`);
					throw new Error(`LessonManager failed to load!`);
				});
		});
	}

	/**
	 * Forces the manager to sync lessons from the database.
	 * @returns {Promise<Lesson[]>} The currently ongoing lessons; an array of Lesson object, or an empty array.
	 */
	forceSync() {
		return new Promise((resolve, reject) => {
			this.client.databaseManager.getOngoingLessons().then(lss => {
				this.lessons = lss;
				resolve(this.lessons);
			}, err => reject(err));
		});
	}

	/**
	 * Checks if a lesson should be started with the member as the teacher
	 * @param {GuildMember} member
	 */
	shouldStartLesson(member) {
		if (!this.client.permManager.isTeacher(member)) return false;
		/* To-Do */
	}

	/**
	 * Checks if the Lesson parameters are present in the timetable
	 * @param {string} subject The lesson subject
	 * @param {string} clsid The class id
	 * @param {GuildMember} teacher The teacher
	 * @returns Promise which resolves with either the LessonID from the timetable or null.
	 */
	checkTimetable(subject, clsid, teacher) {
		return new Promise((resolve, reject) => {
			const day = new Date().getDay();
			const period = time.getCurrentPeriod();
			this.client.databaseManager.getSettings()
				.then(settings => {
					const week = settings.week;
					resolve(timetable[day].find(ls => ls.includes(`!${subject}@${clsid}#${teacher.id}`) && ls.includes(`%${period}`) && ls.includes(`^${week}`)));
				}, reason => reject(reason));
		});
	}

	/**
	 * Caches the Lesson and allocates channels
	 * @param {Lesson} lesson
	 */
	async start(lesson) {
		if (lesson instanceof Lesson == false) throw new Error(`Something went wrong; the lesson is not a Lesson!`);
		this.lessons.push(lesson);
		const settings = await this.client.databaseManager.getSettings();
		const current = timetable[new Date().getDay()].filter(ls => ls.includes(`@${lesson.classid}`) && ls.includes(`%${lesson.period}`) && ls.includes(`^${settings.week}`));
		const ctg = lesson.teacher.member.guild.channels.cache.find(ch => ch.name.startsWith(lesson.classid)).parent;
		const vcs = ctg.children.filter(ch => ch.type == `voice` && !ch.name.includes('*'));
		if (current.length == 0) current.push(null);
		const toAlloc = Math.round(vcs.size / current.length);
		this.logger.info(`Starting a lesson (${lesson.lessonid}@${lesson.classid}); will allocating ${toAlloc} channels`);
		const id = await this.client.databaseManager.pushNewLesson(lesson);
		lesson.id = id;

		let i = 0;
		vcs.each(ch => {
			if (i >= toAlloc) return;
			if (!this.isAllocated(ch)) {
				this.allocate(ch, lesson);
				i++;
			}
		});
		this.logger.debug(`Allocated ${i} channels for ${lesson.lessonid}@${lesson.classid}`);

		const embed = new MessageEmbed()
			.setAuthor(lesson.teacher.name, lesson.teacher.member.user.avatarURL())
			.setColor(`00ff00`)
			.setTitle(`Lesson started`)
			.setDescription(`${lesson.lessonid.toUpperCase()} has started!`)
			.setThumbnail('https://cdn.discordapp.com/attachments/371283762853445643/768906541277380628/Felix-logo-01.png')
			.setTimestamp()
			.setURL(`https://localhost:5000/app/lesson/${lesson.id}`)
			.setFooter(`End the lesson by reacting with the checkered flag`);
		const tchan = ctg.children.find(ch => ch.name.includes(lesson.lessonid));
		const pubmsg = await tchan.send(embed);
		lesson.emit(`start`);
		reactions.addFunctionalReaction(`end`, pubmsg, lesson.teacher.member.user, lesson);
		reactions.addFunctionalReaction([`merge`, `split`], pubmsg, lesson.teacher.member.user, lesson);
		return embed;
	}

	/**
	 * Ends the lesson.
	 * @param {Lesson} lesson The Lesson that should be ended.
	 * @param {string} username the name of the user that is ending the lesson
	 */
	async end(lesson, username = `SYSTEM`) {
		if (lesson instanceof Lesson == false) throw new Error(`Something went wrong; the lesson is not a Lesson!`);
		this.logger.info(`Ending lesson ${lesson.id}; executed by ${username}`);

		try {
			lesson.endedAt = new Date();
			lesson.students.forEach(student => {
				if (student.present) this.left(lesson, student);
			});
			lesson.allocated.forEach(chan => {
				const name = chan.name.slice(1, chan.name.indexOf('$') - 1);
				if (this.isAllocated(chan)) chan.setName(name, `Lesson ended by: ${username}`);
			});
		}
		catch (e) {
			const err = new Error(`Failed to set lesson properties; ${e}`);
			this.logger.error(err);
			lesson.endedAt = null;
			throw err;
		}

		await this.client.databaseManager.endLesson(lesson);
		this.lessons.splice(this.lessons.findIndex(val => val.id == lesson.id), 1);

		const pubembed = new MessageEmbed()
			.setAuthor(username, username == lesson.teacher.name ? lesson.teacher.member.user.avatarURL() : null)
			.setColor(`ff0000`)
			.setTitle(`Lesson ended!`)
			.setDescription(`${lesson.lessonid.toUpperCase()} has ended!`)
			.setThumbnail('https://cdn.discordapp.com/attachments/371283762853445643/768906541277380628/Felix-logo-01.png')
			.setTimestamp()
			.setURL(`https://localhost:5000/app/lesson/${lesson.id}`)
			.setFooter(`The lesson has ended!`);
		const ctg = lesson.teacher.member.guild.channels.cache.find(ch => ch.name.startsWith(lesson.classid)).parent;
		const tchan = ctg.children.find(ch => ch.name.includes(lesson.lessonid));
		tchan.send(pubembed);

		const sumembed = new MessageEmbed()
			.setAuthor(this.client.user.username, this.client.user.avatarURL())
			.setColor(`ffff00`)
			.setTitle(`Summary of ${lesson.lessonid.toUpperCase()}@${lesson.classid.toUpperCase()}`)
			.setDescription(`The simple summary of your lesson:`)
			.setThumbnail('https://cdn.discordapp.com/attachments/371283762853445643/768906541277380628/Felix-logo-01.png')
			.setURL(`https://localhost:5000/app/lesson/${lesson.id}`)
			.setFooter(`You can find the extended summary on the webpage`);

		let i = 0;
		for (const student of lesson.students) {
			if (i >= 25) {
				lesson.teacher.member.createDM().then(dm => dm.send(`The attendance data is only partial - check the full attendance data on the webpage!`));
				break;
			}
			let conms = 0;
			let dconms = 0;
			for (const connect of student.voice.connects) {
				conms += connect.getTime();
			}
			for (const disconnect of student.voice.disconnects) {
				dconms += disconnect.getTime();
			}
			let netms = 0;
			if (conms > dconms) netms = conms - dconms;
			else netms = dconms - conms;
			const min = Math.floor(netms / 60000);
			const atten = [`First joined: ${str.dateToString(student.voice.connects[0])}`, `Total time in lesson: ${min} min`];
			sumembed.addField(student.member.displayName, atten);
			i++;
		}
		lesson.teacher.member.createDM().then(dm => dm.send(sumembed));
		lesson.emit(`end`);
	}

	/**
	 * Syncs the Lesson with the database.
	 * @param {Lesson} lesson The Lesson that should be updated.
	 */
	update(lesson) {
		this.client.databaseManager.updateLesson(lesson);
	}

	/**
	 * Allocates the specified VoiceChannel to the Lesson.
	 * @param {VoiceChannel} channel The VoiceChannel to allocate.
	 * @param {Lesson} lesson The Lesson to allocate the VoiceChannel to.
	 */
	allocate(channel, lesson) {
		channel.setName('~' + channel.name + ' $' + lesson.group, `Allocated by ${lesson.teacher.name}`);
		lesson.allocated.push(channel);
		lesson.emit(`allocate`, channel);
		this.update(lesson);
	}

	/**
	 * Checks if the specified VoiceChannel is allocated or not.
	 * @param {VoiceChannel} channel
	 */
	isAllocated(channel) {
		return channel.name.startsWith(`~`);
	}

	/**
	 *
	 * @param {Lesson} lesson
	 * @param {LessonParticipant} participant
	 */
	joined(lesson, participant) {
		if (participant instanceof LessonStudent && !lesson.students.includes(participant)) lesson.students.push(participant);
		participant.voice.connects.push(new Date());
		participant.present = true;
		lesson.emit(`joined`, participant);
		this.update(lesson);
	}

	/**
	 *
	 * @param {Lesson} lesson
	 * @param {LessonParticipant} participant
	 */
	left(lesson, participant) {
		participant.voice.disconnects.push(new Date());
		participant.present = false;
		lesson.emit(`left`, participant);
		this.update(lesson);
	}

	/**
	 *
	 * @param {Lesson} lesson
	 * @param {LessonParticipant} participant
	 * @param {boolean} state
	 */
	togglemute(lesson, participant, state) {
		participant.voice.mutes.push([new Date(), state]);
		this.update(lesson);
	}

	/**
	 *
	 * @param {Lesson} lesson
	 * @param {LessonParticipant} participant
	 * @param {boolean} state
	 */
	toggledeaf(lesson, participant, state) {
		participant.voice.deafs.push([new Date(), state]);
		this.update(lesson);
	}

	/**
	 *
	 * @param {Lesson} lesson
	 * @param {LessonParticipant} participant
	 * @param {boolean} state
	 */
	togglevideo(lesson, participant, state) {
		participant.voice.video.push([new Date(), state]);
		this.update(lesson);
	}
}

module.exports = LessonManager;