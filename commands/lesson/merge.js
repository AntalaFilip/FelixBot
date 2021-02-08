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
		// If the message is in a DM return
		if (!message.guild) return message.reply('This command can only be used in a server!');
		// Fetch the server, sender, sender as a guildmember, his name, and the timeout
		const guild = message.guild;
		const sender = message.author;
		const member = guild.member(sender);
		const memberName = member.nickname;
		const timeout = args.time || 10;

		// Make sure the member is in a voice channel
		if (member.voice.channel) {
			// Get the sender's channel, the category, then filter voice channels from that category and get the number of the filtered channels
			const originChan = member.voice.channel;
			const ctg = originChan.parent;
			const ctgf = ctg.children.filter(chan => chan.type === `voice`);
			const size = ctgf.size;
			// Initialize a usercount variable, groupcount variable, and a userlist
			let usrcount = 0;
			let groupcount = 1;
			const userlist = new Array();
			// Populate the userlist with arrays
			for (let i = 0; i < size; i++) {
				userlist.push(new Array());
			}
			// Create and populate a message embed
			const embed = new MessageEmbed()
				.setColor(`#0099ff`)
				.setTitle(`Merge`)
				.setDescription(`Will merge users from ${size} groups in ${timeout} seconds`)
				.setAuthor(`${memberName}`, sender.avatarURL())
				.setThumbnail(`https://cdn.discordapp.com/attachments/371283762853445643/768906541277380628/Felix-logo-01.png`)
				.setFooter(`Run !split {size} to split people into groups`)
				.setTimestamp();
			// Send the embed and save the message, then duplicate that embed
			const embedmsg = await message.channel.send(embed);
			const newembed = embedmsg.embeds[0];
			// Set the timeout
			setTimeout(() => {
				// For each voice channel in the category:
				ctgf.each(chan => {
					// If the channel is the same, return
					if (chan == originChan) return groupcount++;
					// For each member in the channel
					for (const usr of chan.members) {
						// Add him to the userlist
						userlist[groupcount - 1].push(usr[1].displayName);
						// Move him to the sender's channel
						usr[1].voice.setChannel(originChan);
						// Increment usercount by one
						usrcount++;
					}
					// Edit the duplicated embed's description
					newembed.setDescription(`Merged ${usrcount} users from ${size} groups into ${originChan.name}`);
					// If the channel wasn't empty, add a field to the embed with the userlist
					if (userlist[groupcount - 1].length != 0) newembed.addField(`Group ${groupcount}`, userlist[groupcount - 1], true);
					// If the groupcount is the same as the size (symbolizing that all channels have been merged), edit the old embed with the duplicated embed
					if (groupcount == size) {
						embedmsg.edit(newembed);
					}
					// Increment groupcount by onme
					groupcount++;
				});
			}, timeout * 1000);
		}
	}
};