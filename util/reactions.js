const { Message, User, MessageReaction, GuildMember, ReactionUserManager } = require("discord.js");
const Lesson = require("../types/lesson/lesson");

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
		const collector = message.createReactionCollector();
		// When the collector gets a reaction
		collector.on(`collect`, async (reaction, user) => {
			if (reaction.me) return;
			// If the emoji is inluded in the emoji list and the User is authorized to add the reaction
			if (emoji.includes(reaction.emoji.toString()) && !authorized || authorized.includes(user)) {
				// Run the function for that reaction
				try {
					await this.runFunction(reaction, lesson);
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
				collector.message.reactions.removeAll();
			});
		}

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
	 * @param {Lesson} lesson
	 */
	async runFunction(reaction, lesson = null) {
		switch(reaction.emoji.toString()) {
		case `🏁`: {
			if (lesson) return await global.client.lessonManager.end(lesson);
			else throw new Error(`No lesson was passed!`);
		}
		case `↩`: {
			return;
		}
		case `🔀`: {
			return;
		}
		}
	},

	getFunctionalEmoji(name) {
		switch(name) {
		case `end`: return `🏁`;
		case `merge`: return `↩`;
		case `split`: return `🔀`;
		default: return null;
		}
	},
};

module.exports = reactionUtils;