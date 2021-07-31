const { TextChannel, Message } = require("discord.js");
const FelixBotClient = require("./client");
const config = require('./config.json');
const fs = require('fs');

/** @type {FelixBotClient} */
const client = global.client;

async function main(chid) {
	/** @type {TextChannel} */
	const fetchFrom = client.guilds.resolve(config.guild).channels.resolve(chid);

	const manager = fetchFrom.messages;

	/** @type {Message[]} */
	const allTheMessages = [];
	const mappedMessages = [];

	while (true) {
		const lastmsg = allTheMessages[allTheMessages.length - 1];
		console.log('Fetching messages from: ' + (lastmsg ? lastmsg.createdTimestamp : 'start'));
		const msgs = await manager.fetch({ limit: 100, before: lastmsg && lastmsg.id });
		allTheMessages.push(...msgs.values());
		const mapped = msgs.map(m => {
			let text = `[${m.createdAt.toLocaleString('sk-SK')}] ${m.member && m.member.displayName || m.author.username}: ${m.content}`;
			if (m.attachments.size) {
				const urls = m.attachments.map(a => a.url).join('\n');
				text += ' [ATTACHMENT] ' + urls + ' [END ATTACHMENT]';
			}
			if (m.embeds.size) {
				text += ' [EMBED NOT SHOWN]';
			}
			return text;
		});
		mappedMessages.push(...mapped);
		if (msgs.size < 100) {
			console.log('Fetched all');
			const json = JSON.stringify(allTheMessages);
			const mappedText = mappedMessages.reverse().join('\n');
			const stat = fs.lstatSync('msg_fetches', { throwIfNoEntry: false });
			if (!stat || !stat.isDirectory()) fs.mkdirSync('msg_fetches');
			fs.writeFileSync(`./msg_fetches/msgs_${fetchFrom.name}.json`, json);
			fs.writeFileSync(`./msg_fetches/msgs_${fetchFrom.name}.txt`, mappedText);
			break;
		}
	}
}

module.exports = main;