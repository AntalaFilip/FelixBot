const { Role } = require("discord.js");
const { Command, CommandoMessage } = require("discord.js-commando");
const LessonManager = require("../../managers/lessonmanager");
const Lesson = require("../../types/lesson/lesson");
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
		let lesson = lmgr.isTeachingLesson(message.member);
		if (!lesson) lesson = lmgr.isInLesson(message.member);
		if (!lesson) return message.reply("You are not teaching a lesson right now!");
		const role = await resolveClass(getChanName(channel));
		if (role instanceof Role && lesson instanceof Lesson) {
			const missing = [];
			role.members.forEach(mem => {
				
			});
			
		}
	}
}
module.exports = MissingCommand;