const { Client, Collection, Interaction } = require("discord.js");
const fs = require('fs');
const path = require('path');
const Logger = require("../util/logger");
const { default: axios } = require("axios");
const { Command } = require("../types/command");
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

class InteractionManager {
	/**
	 *
	 * @param {Client} client
	 */
	constructor(client) {
		this.client = client;
		this.logger = new Logger('InteractionManager');
		this.dsapi = axios.create({ baseURL: 'https://discord.com/api/', headers: { 'Authorization': `Bot ${process.env.TOKEN}` } });
		this.commandDir = path.join(__dirname, '..', 'commands');
		/** @type {Collection<string, Command>} */
		this.commands = new Collection();
		this.cmd = new Collection();

		this.loadCommands();
		this.checkWebhook();
	}

	loadCommands() {
		this.logger.log('Loading commands...');
		this.commands.clear();
		/** @param {fs.Dirent[]} dir */
		const loadCommandsFromDir = (dirpath, dir) => {
			dir.forEach(dirent => {
				if (dirent.isFile() && dirent.name.endsWith('.js')) {
					try {
						const CMD = require(path.join(dirpath, dirent.name));
						/** @type {Command} */
						const cmd = new CMD(this.client);
						this.commands.set(cmd.options.name, cmd);
						this.logger.debug(`Loaded ${cmd.options.name} command`);
					}
					catch (err) {
						this.logger.warn(`Failed to load command ${dirent.name}`, err.message.split('\n')[0]);
						this.logger.verbose(err);
					}
				}
				else if (dirent.isDirectory()) {
					const dp = path.join(dirpath, dirent.name);
					loadCommandsFromDir(dp, fs.readdirSync(dp, { withFileTypes: true }));
				}
			});
		};

		/** @type {fs.Dirent[]} */
		const dir = fs.readdirSync(this.commandDir, { withFileTypes: true });
		loadCommandsFromDir(this.commandDir, dir);
	}

	checkWebhook() {
		const guild = this.client.guilds.cache.find(g => g.id === `702836521622962198`);

	}

	addLoadedCommand(command) {
		this.commands.push(command);
	}

	/**
	 * Dispatches the incoming interaction to its handler function, depending on its type.
	 * @param {Interaction} interaction
	 */
	async handleIncomingInteraction(interaction) {
		const cmd = this.commands.find(command => (command.options.components && interaction.customId && command.options.components.includes(interaction.customId.split('/')[0])) || (interaction.commandId && interaction.commandId == command.options.id));
		if (!cmd) {
			this.logger.warn(`Received an interaction with name ${interaction.commandName} and ID ${interaction.commandId}, custom ID ${interaction.customId}, but no corresponding command exists for it!`);
			return;
		}

		if (interaction.isCommand()) {
			await cmd.run(interaction);
		}
		else if (interaction.isMessageComponent()) {
			await cmd.component(interaction);
		}
	}
}

module.exports = InteractionManager;