const { MessageEmbed } = require("discord.js");
const commando = require("discord.js-commando");

module.exports = class MergeCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: `merge`,
			group: `lesson`,
			memberName: `merge`,
			description: `Merges people back into one group!`,
			examples: [ `merge 20` ],
			guildOnly: true,
			userPermissions: [ `MOVE_MEMBERS` ],
			args: [
				{
					key: `time`,
					prompt: `Enter merge delay (0 for instant merge)`,
					label: `time`,
					type: `integer`,
				},
			],
		});
	}

	async run(message, args) {
		if (!message.guild) return message.reply('This command can only be used in a server!');
		const guild = message.guild;
		const sender = message.author;
		const member = guild.member(sender);
		const memberName = member.nickname;
		const timeout = args[0] || 10;

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
				.setThumbnail(`https://cdn.discordapp.com/attachments/371283762853445643/768906541277380628/Felix-logo-01.png`)
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
};