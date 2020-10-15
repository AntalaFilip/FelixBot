const { MessageEmbed } = require("discord.js");

module.exports = {
	name: 'merge',
	description: 'Merges people back into one group!',
	args: false,
	execute(message, args) {
		if (!message.guild) return message.reply('This command can only be used in a server!');
		const guild = message.guild;
		const sender = message.author;
		const member = guild.member(sender);
		const memberName = member.nickname;
		const timeout = args[0] || 10;

		if (member.hasPermission('MOVE_MEMBERS')) {
			if (member.voice.channel) {
				const originChan = member.voice.channel;
				const initial = originChan.name.slice(0, 2);
				const size = 4;
				let usrcount = 0;
				let groupcount = 1;
				const userlist = new Array([], [], [], []);
				const embed = new MessageEmbed()
					.setColor(`#0099ff`)
					.setTitle(`Merge`)
					.setDescription(`Will merge users from ${size} groups in ${timeout} seconds`)
					.setAuthor(`${memberName}`, sender.avatarURL())
					.setThumbnail(`https://cloud1p.edupage.org/cloud?z%3AkhC0isQrynC2RbuTUyyl%2FmcaKKwqy1TsRRY8IutBDggGZOK31CbLE7BtBZe89eyL%2B9WJgUXp1Hl5H82y9Z2xkg%3D%3D`)
					.setFooter(`Run !split {size} to split people into groups`)
					.setTimestamp();
				const embedmsg = message.channel.send(embed);
				setTimeout(() => {
					while (groupcount <= size) {
						const chan = guild.channels.cache.find(channel => channel.name === `${initial}-${groupcount}`);
						for (const usr of chan.members) {
							usr[1].voice.setChannel(originChan);
							console.log(userlist);
							if (usr[1].username) userlist[groupcount - 1].push(usr[1].username);
							else userlist[groupcount - 1].push(usr[1].user.nickname);
							usrcount++;
						}
						embed.setDescription(`Merged ${usrcount} users from ${size} groups into ${originChan.name}`);
						if (userlist[groupcount - 1].length) embed.addField(`Group ${groupcount}`, userlist[groupcount - 1], true);
						if (groupcount == size) {
							embedmsg.then((msg) => {msg.edit(embed);});
						}
						groupcount++;
					}
				}, timeout * 1000);
			}
		}
		else {message.delete();}
	},
};