const { Command, CommandoMessage } = require("discord.js-commando");
const LessonManager = require("../../managers/lessonmanager");
const { getChanName, resolveClass } = require("../../util/stringutils");

class MissingCommand extends Command {
	/**
	 *
	 * @param {CommandoClient} client
	 */
	constructor(client) {
		super(client, {
			name: `missing`,
			group: `lesson`,
			memberName: `missing`,
			description: `Shows people missing in the lesson`,
			examples: [`missing`],
			guildOnly: true,
			userPermissions: [`MOVE_MEMBERS`],
			args: [
				{
					key: `time`,
					prompt: `Enter merge delay (0 for instant merge):`,
					label: `delay`,
					type: `integer`,
					default: 5,
				},
			],
		});
	}

	/**
	 *
	 * @param {CommandoMessage} message
	 */
	async run(message) {
		/**
		 * @type {LessonManager}
		 */
		const lmgr = this.client.lessonManager;
		const channel = message.channel;
		const lesson = lmgr.isTeachingLesson(message.member) || lmgr.isInLesson(message.member);
		if (!lesson) return message.reply("You are not teaching a lesson right now!");
		const role = await resolveClass(getChanName(channel));
		if (role) {
			const missing = [];
			role.members.forEach(mem => {
				if (!lesson.students.includes(mem) && !lesson.teacher.member == mem) {
					missing.push(mem);
				}
			});
		}
	}
}