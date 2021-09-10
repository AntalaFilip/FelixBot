const { VoiceChannel, Collection } = require("discord.js");
const LessonStudent = require("./lessonstudent");
const LessonTeacher = require("./lessonteacher");
const EventEmitter = require('events');
const EduCard = require("../edu/educard");
const FelixBotClient = require("../../client");
const LessonParticipant = require("./lessonparticipant");

class Lesson extends EventEmitter {
	/**
	 * Creates a lesson object
	 * @param {Object} data
	 * @param {number} [data.id] The ID of the Lesson, generated automatically if creating a new Lesson. If present, Lesson won't get pushed to database automatically.
	 * @param {EduCard} [data.educard]
	 * @param {number} [data.ttver]
	 * @param {Date} [data.startedat]
	 * @param {Date} [data.endedat]
	 * @param {import("discord.js").Snowflake[]} [data.channels]
	 * @param {import("./lessonparticipant").LessonParticipantObject[]} [data.teachers]
	 * @param {import("./lessonparticipant").LessonParticipantObject[]} [data.pobjs]
	 */
	constructor({ id, educard, ttver, startedat, endedat, channels, teachers, pobjs }) {
		super();
		this.id = id;
		this.ttver = ttver;
		/** @type {VoiceChannel[]} */
		this.allocated = new Array();
		this.card = educard;
		// Create a LessonTeacher from the teacher member
		/** @type {LessonTeacher[]} */
		this.teachers = id
			? teachers.map(
				t =>
					new LessonTeacher(
						this,
						null,
						t,
						this.card.manager.teachers.find(et => t.member === et.member),
					))
			: new Array();

		if (channels) this.allocated = channels.map(c => this.card.guild.channels.cache.filter(cc => c === cc.id));

		this.participants = new Collection(
			pobjs.map(
				pobj => {
					const student = this.card.manager.students.find(
						s =>
							s.member
							&& (s.member === pobj.member || s.member.displayName === pobj.name),
					);
					return [
						pobj.member
							? pobj.member.id
							: pobj.name,
						student ? new LessonStudent(this, null, pobj, student) : new LessonParticipant(this, null, pobj),
					];
				},
			));

		// Assign started at
		if (startedat) this.startedAt = new Date(startedat);
		else this.startedAt = new Date();
		if (endedat) this.endedAt = new Date(endedat);
		else this.endedAt = null;
	}

	/** @returns {FelixBotClient} */
	get client() {
		return global.client;
	}

	get manager() {
		return this.client.lessonManager;
	}

	get frozen() {
		return Boolean(this.endedAt);
	}

	/**
	 * @param {*} lesson
	 * @returns {lesson is Lesson}
	 */
	static is(lesson) {
		return lesson instanceof Lesson;
	}
}

module.exports = Lesson;