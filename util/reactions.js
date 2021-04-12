const { Message, User, MessageReaction, GuildMember, ReactionUserManager } = require("discord.js");
const Lesson = require("../types/lesson/lesson");
const { CommandoMessage } = require("discord.js-commando");

const reactionUtils = {
	/**
	 * Adds a functional reaction to the message
	 * @param {string | string[]} functionname
	 * @param {Message} message
	 * @param {User[]} authorized The members authorized to react
	 * @param {Lesson} lesson
	 */
	async addFunctionalReaction(functionname, message, authorized = null, lesson = null) {
		// Create an empty array of emojis
		const emoji = new Array();
		// If the functionname var is an array then get functional emojis for each of the values, else just get the one
		if (functionname instanceof Array) {
			functionname.forEach(val => {
				const em = this.getFunctionalEmoji(val);
				if (em) emoji.push(em);
			});
		}
		else {
			const em = this.getFunctionalEmoji(functionname);
			if (em) emoji.push(em);
		}

		// If no functional emojis have been found from the functionname, throw a new error, that should not happen.
		if (!emoji) throw new Error();
		// Create a Reaction collector on the passes message
		const collector = message.createReactionCollector((reaction, user) => emoji.includes(reaction.emoji.name), { time: 60 * 60 * 1000 });
		// When the collector gets a reaction
		collector.on(`collect`, async (reaction, user) => {
			if (user.id == global.client.user.id) return;
			// If the emoji is inluded in the emoji list and the User is authorized to add the reaction
			if (!authorized || authorized.includes(user) || message.guild.member(user).hasPermission(`ADMINISTRATOR`)) {
				// Run the function for that reaction
				try {
					await this.runFunction(reaction, user, lesson);
				}
				catch (err) {
					message.channel.send(`Caught error while executing action: ${err}`);
					global.client.emit(`error`, `Failed to execute FunctionalReaction; ${err}`);
				}
				reaction.users.remove(user);
			}
			// Else remove that reaction to cut down on spam
			else {
				reaction.users.remove(user);
			}
		});
		// If there was a lesson passed
		if (lesson) {
			// When the lesson ends, stop the collector and remove all reactions, again to cut down on spam
			lesson.on(`end`, () => {
				collector.stop();
			});
		}
		collector.once(`end`, () => {
			collector.message.reactions.removeAll();
		});

		// Add the desired reactions
		emoji.forEach(em => {
			try {
				message.react(em);
			}
			catch (e) {
				global.client.emit(`error`, new Error(`Failed to react to message with emoji ${em}; ${e}`));
			}
		});
	},

	/**
	 *
	 * @param {MessageReaction} reaction
	 * @param {User} user
	 * @param {Lesson} lesson
	 */
	async runFunction(reaction, user, lesson = null) {
		const MergeCommand = require('../commands/lesson/merge');
		switch (reaction.emoji.toString()) {
		case `🏁`: {
			if (lesson) return await global.client.lessonManager.end(lesson, lesson.teacher.member.guild.member(user).displayName);
			else throw new Error(`No lesson was passed!`);
		}
		case `↩`: {
			const cmd = new MergeCommand(global.client);
			cmd.run(new CommandoMessage(reaction.message), { time: 5 });
			break;
		}
		case `🔀`: {
			return;
		}
		}
	},

	getFunctionalEmoji(name) {
		switch (name) {
		case `end`: return `🏁`;
		case `merge`: return `↩`;
		case `split`: return `🔀`;
		case `playpause`: return `⏯`;
		case `play`: return `▶`;
		case `pause`: return `⏸`;
		case `stop`: return `⏹`;
		case `record`: return `⏺`;
		default: return null;
		}
	},
};

module.exports = reactionUtils;