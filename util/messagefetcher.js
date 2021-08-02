const { TextChannel, Message, ThreadChannel, CategoryChannel } = require("discord.js");
const FelixBotClient = require("../client");
const config = require('../config.json');
const fs = require('fs');
const path = require("path");

/** @type {FelixBotClient} */
const client = global.client;

async function main(chid) {
	const fetchFrom = client.guilds.resolve(config.guild).channels.resolve(chid);
	if (fetchFrom instanceof CategoryChannel) {
		const children = fetchFrom.children;
		const textonly = children.filter(ch => ch.isText()).array();
		for (const channel of textonly) {
			await fetch(channel);
		}
	}
	else if (fetchFrom.isText() || fetchFrom.isThread()) {
		await fetch(fetchFrom);
	}
	else {
		throw new Error('This function can only be used with Text|Thread|Category channels!');
	}
}

/**
 *
 * @param {TextChannel | ThreadChannel} fetchFrom
 */
async function fetch(fetchFrom) {
	const manager = fetchFrom.messages;
	client.logger.debug(`Starting message fetch from channel ${fetchFrom.name}(${fetchFrom.id})`);

	/** @type {Message[]} */
	const allTheMessages = [];
	const mappedMessages = [];

	// eslint-disable-next-line no-constant-condition
	while (true) {
		const lastmsg = allTheMessages[allTheMessages.length - 1];
		client.logger.debug('Fetching messages from: ' + (lastmsg ? lastmsg.createdTimestamp : 'start'));
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
			client.logger.debug('Fetched all!');
			const json = JSON.stringify(allTheMessages);
			const mappedText = mappedMessages.reverse().join('\n');

			let p = path.join(__dirname, '..', 'download', 'secure', 'msg_fetches');
			const stat = fs.lstatSync(p, { throwIfNoEntry: false });
			if (!stat || !stat.isDirectory()) fs.mkdirSync(p);

			const parent = fetchFrom.parent;
			if (parent) {
				p = path.join(p, `${parent.id}_${parent.name}`);
				const s = fs.lstatSync(p, { throwIfNoEntry: false });
				if (!s || !s.isDirectory()) fs.mkdirSync(p);
				if (parent.parent) {
					const parent2 = parent.parent;
					p = path.join(p, `${parent2.id}_${parent2.name}`);
					const s2 = fs.lstatSync(p, { throwIfNoEntry: false });
					if (!s2 || !s2.isDirectory()) fs.mkdirSync(p);
				}
			}
			fs.writeFileSync(path.join(p, `${fetchFrom.id}_${fetchFrom.name}.json`), json);
			fs.writeFileSync(path.join(p, `${fetchFrom.id}_${fetchFrom.name}.txt`), mappedText);
			break;
		}
	}
}

module.exports = main;