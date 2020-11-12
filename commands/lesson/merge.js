const { MessageEmbed } = require("discord.js");
const commando = require("discord.js-commando");

module.exports = class MergeCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: `merge`,
			group: `lesson`,
			memberName: `merge`,
			description: `Merges people from all subchannels back into the main one`,
			examples: [`merge 20`],
			guildOnly: true,
			userPermissions: [`MOVE_MEMBERS`],
			args: [
				{
					key: `time`,
					prompt: `Enter merge delay (0 for instant merge):`,
					label: `delay`,
					type: `integer`,
					default: 10,
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
		const timeout = args.time || 10;

		if (member.voice.channel) {
			const originChan = member.voice.channel;
			const ctg = originChan.parent;
			const ctgf = ctg.children.filter(chan => chan.type === `voice`);
			const size = ctgf.size;
			let usrcount = 0;
			let groupcount = 1;
			const userlist = new Array();
			for (let i = 0; i < size; i++) {
				userlist.push(new Array());
			}
			const embed = new MessageEmbed()
				.setColor(`#0099ff`)
				.setTitle(`Merge`)
				.setDescription(`Will merge users from ${size} groups in ${timeout} seconds`)
				.setAuthor(`${memberName}`, sender.avatarURL())
				.setThumbnail(`https://cdn.discordapp.com/attachments/371283762853445643/768906541277380628/Felix-logo-01.png`)
				.setFooter(`Run !split {size} to split people into groups`)
				.setTimestamp();

			const embedmsg = await message.channel.send(embed);
			const newembed = embedmsg.embeds[0];
			setTimeout(() => {
				ctgf.each(chan => {
					if (chan == originChan) return groupcount++;
					for (const usr of chan.members) {
						userlist[groupcount - 1].push(usr[1].displayName);
						usr[1].voice.setChannel(originChan);
						console.log(userlist);
						usrcount++;
					}
					newembed.setDescription(`Merged ${usrcount} users from ${size} groups into ${originChan.name}`);
					if (userlist[groupcount - 1].length != 0) newembed.addField(`Group ${groupcount}`, userlist[groupcount - 1], true);
					if (groupcount == size) {
						embedmsg.edit(newembed);
					}
					groupcount++;
				});
			}, timeout * 1000);
		}
	}
};