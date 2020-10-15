const { MessageEmbed } = require("discord.js");
module.exports = {
	name: 'split',
	description: 'Auto split people into groups!',
	args: true,
	execute(message, args) {
		if (!message.guild) return message.reply('This command can only be used in a server!');
		const guild = message.guild;
		const sender = message.author;
		const member = guild.member(sender);
		const memberName = member.nickname;

		if (member.hasPermission('MOVE_MEMBERS')) {
			if (member.voice.channel) {
				const originChan = member.voice.channel;
				const initial = originChan.name.slice(0, 2);
				const gSize = parseInt(args[0]);
				const maxSize = 4;
				if (gSize > maxSize) return message.reply(`There can only be ${maxSize} groups or less!`);
				const collection = originChan.members;
				if (!isNaN(gSize)) {
					let i = 1;
					const userlist = new Array([], [], [], []);
					for (const usr of collection) {
						const chan = guild.channels.cache.find(channel => channel.name === `${initial}-${i}`);
						if (usr[1].nickname == memberName && !args[1] === 'true') break;
						usr[1].voice.setChannel(chan);
						if (usr[1].nickname) userlist[i - 1].push(usr[1].nickname);
						else userlist[i - 1].push(usr[1].user.username);
						if (i < gSize) i++;
						else i = 1;
					}
					const embed = new MessageEmbed()
						.setColor('#0099ff')
						.setTitle('Split')
						.setDescription(`Created ${gSize} groups`)
						.setAuthor(`${memberName}`, sender.avatarURL())
						.setThumbnail('https://cloud1p.edupage.org/cloud?z%3AkhC0isQrynC2RbuTUyyl%2FmcaKKwqy1TsRRY8IutBDggGZOK31CbLE7BtBZe89eyL%2B9WJgUXp1Hl5H82y9Z2xkg%3D%3D')
						.setFooter('Run !merge to move everyone back')
						.setTimestamp();
					for (let ii = 1; ii <= gSize; ii++) {
						console.log(ii);
						if (gSize >= ii) {
							embed.addField(`Group ${ii}`, userlist[ii - 1], true);
						}
					}
					message.reply(embed);
					// message.delete({ timeout: 5000 });
					console.log(userlist);
				}
				else {
					message.reply('You need to provide a number!');
				}
			}
			else {
				message.reply('You need to be in a voice channel!');
			}
		}
		else {
			message.delete();
		}
	},
};