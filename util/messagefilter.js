const { Message } = require('discord.js');
const filters = require('../messageFilter.json');

const messageFilter = {
	/**
	 * @param {import('discord.js').Message} message the message to check
	 * @param {boolean} takeAction whether to take the specified action
	 */
	checkMessageContent: async (message, takeAction = true) => {
		const content = message.content;
		const activeFilters = filters.filter(f => f.active);
		for (const filter of activeFilters) {
			const match = filter.filter.every(condition => {
				return condition.find(text => content.search(text) != -1);
			});
			if (!match) continue;

			if (!takeAction) return filter;

			for (const action of filter.actions) {
				try {
					await messageFilter.applyAction(action, message, filter.name);
				}
				catch(err) {
					global.client.logger.warn(`Encountered an error while filtering message ${message.id} with ${filter.name}`, err);
				}
			}
		}

		return false;
	},

	/**
	 * @param {Object} actionData
	 * @param {string} [actionData.name]
	 * @param {string} [actionData.reason]
	 * @param {string} [actionData.content]
	 * @param {Message} message
	 */
	applyAction: async (actionData, message, filtername) => {
		switch (actionData.name) {
			case "notify": {
				if (actionData.target === "author") {
					const messageHeader = `**Tvoja správa bola automaticky zachytená filterom ($filter):**\n`;
					const messageFooter = `\n*Ak si myslíš, že to je omyl, prosím, kontaktuj našich administrátorov.*`;
					const toFormat = messageHeader + `\`${actionData.content}\`` + messageFooter;
					await message.author.send(messageFilter.formatMessage(toFormat, message));
					return true;
				}
				else if (actionData.target === "member") {
					const member = await message.guild.members.fetch(actionData.target_id);
					if (!member) throw new Error(`Member with id ${actionData.target_id} does not exist in the guild!`);
					const msg = messageFilter.formatMessage(actionData.content, message, filtername);
					await member.send(msg);
					return true;
				}
				break;
			}
			case "respond": {
				const response = messageFilter.formatMessage(actionData.content);
				const reply = await message.reply(response);
				if (actionData.for) setTimeout(async () => await reply.delete(), actionData.for);
				return true;
			}
			case "timeout": {
				await message.member.timeout(actionData.length, actionData.reason);
				return true;
			}
			case "delete": {
				await message.delete();
				return true;
			}
			default: {
				return false;
			}
		}
	},

	/**
	 * @param {string} content
	 * @param {Message} message
	 */
	formatMessage: (content, message, filtername = 'manually triggered filter') => {
		content = content.replaceAll('$messageid', message.id);
		content = content.replaceAll('$author', message.member.displayName);
		content = content.replaceAll('$memberid', message.member.id);
		content = content.replaceAll('$filter', filtername);
		content = content.replaceAll('$channel', message.channel.name);

		content += `\nORIGINÁLNA SPRÁVA:\n\`\`\`${message.cleanContent}\`\`\``;
		return content;
	},
};

module.exports = { messageFilter };