const { MessageEmbed } = require(`discord.js`);
const commando = require(`discord.js-commando`);

module.exports = class SplitCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: `split`,
			group: `lesson`,
			memberName: `split`,
			description: `Split people into random groups`,
			examples: [ `split 2`, `split 4` ],
			guildOnly: true,
			userPermissions: [ `MOVE_MEMBERS` ],
			args: [
				{
					key: `gsize`,
					prompt: `Enter group size:`,
					label: `groupsize`,
					type: `integer`,
					min: 2,
					max: 6,
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
			let collection = originChan.members;
			if (collection.size <= gSize) {
				message.reply(`There are not enough people in this channel (${collection.size - 1}) to be split into ${gSize} groups!`)
					.then(res => {res.delete({ timeout: 5000 }); message.delete({ timeout: 5000 });});
				return;
			}
			const userlist = new Array([], [], [], [], [], []);
			let i = 1;
			let ii = 1;
			while (collection.size > i) {
				const usr = collection.random();
				if (usr == member) continue;
				console.log(usr);
				const chan = guild.channels.cache.find(channel => channel.name.contains(`${initial}-${ii}`));
				usr.voice.setChannel(chan);
				userlist[ii - 1].push(usr.displayName);
				collection = originChan.members;
				i++;
				ii++;
				if (ii > gSize) ii = 1;
			}

			const embed = new MessageEmbed()
				.setColor('#0099ff')
				.setTitle('Split')
				.setDescription(`Created ${gSize} groups`)
				.setAuthor(`${memberName}`, sender.avatarURL())
				.setThumbnail('https://cdn.discordapp.com/attachments/371283762853445643/768906541277380628/Felix-logo-01.png')
				.setFooter('Run !merge to move everyone back')
				.setTimestamp();
			for (let iii = 0; iii < gSize; iii++) {
				embed.addField(`Group ${iii + 1}`, userlist[iii], true);
			}
			message.reply(embed);
			// message.delete({ timeout: 5000 });
			console.log(userlist);
		}
	}
};