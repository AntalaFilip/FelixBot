const { CommandInteraction, MessageComponentInteraction } = require("discord.js");

class Command {
	/**
	 *
	 * @param {import("../client")} client
	 * @param {*} options
	 */
	constructor(client, options) {
		this.client = client;
		this.options = options;

		this.client.logger.debug(`Instantiating command ${options.name}`);
	}

	/**
	 * @abstract
	 * @param {CommandInteraction} interaction
	 * @returns {Promise<void>}
	 */
	// eslint-disable-next-line
	run(interaction) {}
	/**
	 * @abstract
	 * @param {MessageComponentInteraction} interaction
	 * @returns {Promise<void>}
	 */
	// eslint-disable-next-line
	component(interaction) {}
}

module.exports = { Command };