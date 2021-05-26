const { TextChannel } = require("discord.js");
const { Command, CommandoMessage } = require("discord.js-commando");
const fs = require('fs');
const path = require('path');
const targz = require('targz');
require('dotenv').config({ path: path.join(__dirname, '../../') });

class GetAttachmentCommand extends Command {
	constructor(client) {
		super(client, {
			name: `getattach`,
			group: `dev`,
			memberName: `getattachments`,
			description: `Gets all attachments from target channel`,
			examples: [`getattach <channel>`],
			userPermissions: ['MANAGE_CHANNELS'],
			guildOnly: true,
			args: [
				{
					key: 'channel',
					prompt: 'Link a channel (using #)',
					type: 'text-channel',
				},
			],
		});
	}

	/**
	 *
	 * @param {CommandoMessage} message
	 * @param {{channel: TextChannel}} args
	 */
	async run(message, args) {
		const guild = message.guild;
		const channel = args.channel;

		message.channel.send('Fetching attachments...');
		const data = await this.exec(channel);
		message.reply('Fetched all attachments!');
		message.reply(`Download them at ${process.env.URL}/download/${data}`);
	}

	/**
	 *
	 * @param {TextChannel} channel
	 */
	async exec(channel) {
		if (process.env.NODE_ENV !== 'PRODUCTION') throw new Error('This command may only be used in production');
		const logger = global.clientlogger;
		logger.debug(`Starting attachment export from channel ${channel.id} in guild ${channel.guild.name} (${channel.guild.id})`);
		const temppath = path.join(__dirname, 'temp');
		if (fs.existsSync(temppath)) {
			logger.debug(`Temp folder exists, clearing it`);
			fs.rmdirSync(temppath);
			fs.mkdirSync(temppath);
		}
		else {
			fs.mkdirSync(temppath);
		}
		const folderpath = path.join(temppath, `${new Date().getTime()}`);
		fs.mkdirSync(folderpath);
		logger.debug(`Fetching messages...`);
		const messages = await channel.messages.fetch();
		messages.forEach(msg => {
			const author = msg.member;
			const authorPath = path.join(folderpath, author.displayName);
			const attachments = msg.attachments;
			if (attachments.size > 0) {
				if (!fs.existsSync(authorPath)) {
					console.log(`Creating directory for ${author.displayName} (${author.id})`);
					fs.mkdirSync(authorPath);
				}
				attachments.forEach(att => {
					const filepath = path.join(authorPath, att.id);
					console.log(`Writing new file to ${filepath}`);
					fs.writeFileSync(filepath, att.attachment);
				});
			}
		});
		console.log(`Finished writing files`);
		const exportname = `export_${new Date().getTime()}.tar.gz`;
		const exportpath = path.join(temppath, exportname);
		targz.compress({ src: folderpath, dest: exportpath }, err => {
			if (err) {
				logger.error('Failed to compress files to targz');
				logger.error(err);
				throw new Error('Failed to write targz file');
			}
			fs.copyFileSync(exportpath, path.join(__dirname, '../../', 'download'));
			return exportname;
		});
	}
}
module.exports = GetAttachmentCommand;