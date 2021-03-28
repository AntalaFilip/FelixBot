const { Message } = require("discord.js");

const MessageUtils = {
	/**
	 *
	 * @param {Array<Promise<Message>> | Message | Promise<Message>} messages
	 * @param {number?} timeout the timeout until the messages will be deleted in ms
	 */
	async clearMessageAfter(messages, timeout = 5000) {
		const delmsg = (msg) => {
			if (msg instanceof Message) {
				msg.delete({ timeout: timeout });
			}
			else {
				msg.then(m => m.delete({ timeout: timeout }));
			}
		};

		if (messages instanceof Array) {
			messages.forEach(delmsg);
		}
		else {
			delmsg(messages);
		}
	},
};

module.exports = MessageUtils;