const { MessageEmbed, CommandInteraction, MessageActionRow, MessageSelectMenu, Message, MessageComponentInteraction } = require("discord.js");
const timetable = require(`../../timetable`);
const { Command } = require("../../types/command");
const { ComMessageResponse, CallbackType, MessageComponent, CmdMessageResponse } = require("../../util/interactions");
const { getChanName, removeStartingDot } = require("../../util/stringutils");
const sharp = require('sharp');
const { default: axios } = require("axios");
const fetch = require('node-fetch');

class TimetableCommand extends Command {
	constructor(client) {
		super(client, {
			id: `863726535490666536`,
			name: `timetable`,
			group: `lesson`,
			memberName: `timetable`,
			description: `Prints the specified timetable`,
			examples: [`timetable`],
			components: [`timetable_select_class`],
		});

		this.components = {
			timetableSelect: (member, roles) => (
				new MessageSelectMenu({
					placeholder: 'Select class:',
					minValues: 1,
					maxValues: 1,
					customId: `timetable_select_class/${member.id}`,
				})
					.addOptions(
						roles.map(r => ({
							label: r.name,
							value: r.name.toLowerCase(),
						})),
					)
			),
		};
	}

	/**
	 *
	 * @param {CommandInteraction} interaction
	 * @returns
	 */
	async run(interaction) {
		const guild = interaction.guild;
		const sprom = this.client.databaseManager.getSettings(guild.id);
		// TODO: future-proof: return in DM's
		const member = interaction.member;
		const chan = interaction.channel;
		const args = interaction.options;
		const cls = args.get('class');
		const silent = args.get('silent');

		let clsid = cls && cls.value.slice(0, 2);
		if (!clsid) clsid = getChanName(chan).slice(0, 2);
		const role = guild.roles.cache.find(r => r.name.toLocaleLowerCase().startsWith(clsid));
		if (!role) return await interaction.reply({ ephemeral: true, content: `Invalid class, try specifying a class in the command!` });

		const embed = await this.exec(member, role, clsid);

		/** @type {boolean} */
		const ephemeral = (silent && silent.value) ?? true;
		const settings = await sprom;
		const roles = guild.roles.cache.filter(r => settings.classes.find(c => c.name == r.name.toLocaleLowerCase()));
		await interaction.reply({
			ephemeral: ephemeral,
			embeds: [embed],
			components: [
				new MessageActionRow()
					.addComponents(
						this.components.timetableSelect(member, roles),
					),
			],
		});
	}

	async exec(member, role, clsid) {
		const guild = member.guild;
		const settings = await this.client.databaseManager.getSettings(guild.id);
		const cls = settings.classes.find(c => c.name.startsWith(clsid));
		if (!role) role = guild.roles.cache.find(r => r.name.toLocaleLowerCase().startsWith(clsid));
		const embed = new MessageEmbed()
			.setColor(`#000000`)
			.setTitle(`Timetable for ${role.name}`)
			.setURL(`https://felix.edupage.org/timetable/`)
			.setAuthor(this.client.user.username, this.client.user.avatarURL())
			.setDescription(`This is the timetable for <@&${role.id}>, requested by <@${member.id}>`)
			.setThumbnail(`https://cdn.discordapp.com/attachments/371283762853445643/768906541277380628/Felix-logo-01.png`)
			.setFooter(timetable[0][0])
			.setTimestamp();

		const scrapeSite = await fetch(`https://${settings.edupage}.edupage.org/timetable/view.php?class=${cls.eduID}`);
		const html = await scrapeSite.text();
		const svg = html.slice(html.indexOf('<svg>'), html.indexOf('</svg>') + 6);

		for (let i = 0; i < timetable.length; i++) {
			const processed = new Array();
			const filtered = timetable[i].filter(el => el.includes(`@${clsid}`) || el.includes(`&${clsid}`));
			if (filtered.length == 0) processed.push(`No lessons!`);
			filtered.forEach((el, ii) => {
				const lesson = el.substring(1, el.indexOf(`@`));
				const teacher = guild.members.resolve(el.substring(el.indexOf(`#`) + 1, el.indexOf(`$`)));
				const group = el.substring(el.indexOf(`$`) + 1, el.indexOf(`%`));
				const period = el.substring(el.indexOf(`%`) + 1, el.indexOf(`^`));
				if (!lesson || !teacher || !group || !period) {
					this.client.logger.warn(`Invalid timetable entry! ${i}:${ii}:${clsid}`);
					processed.push(`INVALID ENTRY: ${el}`);
					return;
				}
				processed.push(`${period}: ${lesson.toUpperCase()} with ${removeStartingDot(teacher.displayName)} group ${group.toUpperCase()}`);
			});
			switch (i) {
				case 1:
					embed.addField(`Monday`, processed.join('\n'));
					break;
				case 2:
					embed.addField(`Tuesday`, processed.join('\n'));
					break;
				case 3:
					embed.addField(`Wednesday`, processed.join('\n'));
					break;
				case 4:
					embed.addField(`Thursday`, processed.join('\n'));
					break;
				case 5:
					embed.addField(`Friday`, processed.join('\n'));
					break;
			}
		}

		return embed;
	}

	/**
	 *
	 * @param {string} rawid
	 * @param {MessageComponentInteraction} interaction
	 * @returns
	 */
	async component(rawid, interaction) {
		const split = rawid.split('/');
		const id = split[0];
		const args = split.slice(1);
		if (id === `timetable_select_class` && interaction.isSelectMenu()) {
			const member = interaction.member;
			const isOriginalAuthor = (args[0] == member.id);
			const cls = interaction.values[0];
			const clsid = cls.slice(0, 2);

			const embed = await this.exec(member, null, clsid);

			if (isOriginalAuthor) {
				await interaction.update({ embeds: [embed] });
				return;
			}
			else {
				await interaction.reply({ ephemeral: true, embeds: [embed] });
				return;
			}
		}
	}
}

module.exports = TimetableCommand;