/* const { MessageEmbed } = require(`discord.js`);
const commando = require(`discord.js-commando`);

module.exports = class SplitCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: `split`,
			group: `lesson`,
			memberName: `split`,
			description: `Split people into random groups`,
			examples: [ `split 4`, `split 5` ],
			guildOnly: true,
			userPermissions: [`MOVE_MEMBERS`],
			args: [
				{
					key: `gsize`,
					prompt: `Enter group size:`,
					label: `groupsize`,
					type: `int`,
					min: 1,
					max: 4,
				},
			],
		});
	}
	async run(message, args) {
		const guild = message.guild;
		const sender = message.author;
		const member = guild.member(sender);
		const memberName = member.nickname;

		if (member.voice.channel) {
			const originChan = member.voice.channel;
			const initial = originChan.name.slice(0, 2);
			const gSize = args.gsize;
			// const maxSize = 4;
			// if (gSize > maxSize) return message.reply(`There can only be ${maxSize} groups or less!`);
			const lessons = this.client.lessons;
			const lesson = lessons.find(lsn => lsn.class === initial);
			if (lesson) {

			}
			else {
				const collection = originChan.members;
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
					.setThumbnail('https://cdn.discordapp.com/attachments/371283762853445643/768906541277380628/Felix-logo-01.png')
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
		}
	}
}; */