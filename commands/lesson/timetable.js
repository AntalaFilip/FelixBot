const { MessageEmbed } = require("discord.js");
const commando = require(`discord.js-commando`);
const timetable = require(`../../timetable`);

module.exports = class TimetableCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: `timetable`,
			group: `lesson`,
			memberName: `timetable`,
			description: `Prints the specified timetable`,
			examples: [ `timetable` ],
			guildOnly: true,
			args: [
				{
					key: `class`,
					prompt: `Class name:`,
					label: `class`,
					type: `string`,
					oneOf: [ `plameniaky`, `sovy`, `vydry`, `vážky`, `koaly`, `pandy`, `here` ],
					default: `here`,
				},
			],
		});
	}

	async run(message, args) {
		const member = message.member;
		const chan = message.channel;
		let clsid = args.class.toLowerCase().slice(0, 2);
		if (clsid === `he`) clsid = chan.name.slice(0, 2);
		const role = this.client.guilds.resolve(`702836521622962198`).roles.cache.find(role => role.name.toLocaleLowerCase().includes(clsid));
		if (!role) return message.reply(`Invalid class, try specifying a class in the command!`);
		const embed = new MessageEmbed()
			.setColor(`#000000`)
			.setTitle(`Timetable for ${role.name}`)
			.setURL(`https://felix.edupage.org/timetable/`)
			.setAuthor(this.client.user.username, this.client.user.avatarURL())
			.setDescription(`This is the timetable for <@&${role.id}>, requested by <@${member.id}>`)
			.setThumbnail(`https://cdn.discordapp.com/attachments/371283762853445643/768906541277380628/Felix-logo-01.png`)
			.setFooter(timetable[0])
			.setTimestamp();

		for (let i = 0; i < timetable.length; i++) {
			const processed = new Array();
			const filtered = timetable[i].filter(el => el.includes(`@${clsid}`) || el.includes(`&${clsid}`));
			if (filtered.length == 0) processed.push(`No lessons!`);
			filtered.forEach(el => {
				const lesson = el.substring(1, el.indexOf(`@`));
				const teacher = this.client.guilds.cache.find(gld => gld.id === `702836521622962198`).members.resolve(el.substring(el.indexOf(`#`) + 1, el.indexOf(`$`)));
				const group = el.substring(el.indexOf(`$`) + 1, el.indexOf(`%`));
				const period = el.substring(el.indexOf(`%`) + 1, el.indexOf(`^`));
				processed.push(`${period}: ${lesson.toUpperCase()} with ${teacher.nickname.substring(1)} group ${group.toUpperCase()}`);
			});
			switch (i) {
			case 1:
				embed.addField(`Monday`, processed);
				break;
			case 2:
				embed.addField(`Tuesday`, processed);
				break;
			case 3:
				embed.addField(`Wednesday`, processed);
				break;
			case 4:
				embed.addField(`Thursday`, processed);
				break;
			case 5:
				embed.addField(`Friday`, processed);
				break;
			}
		}
		message.embed(embed);
		message.delete();
	}
};