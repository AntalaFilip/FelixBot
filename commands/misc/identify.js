const { GuildMember, Role, TextChannel, MessageEmbed, CommandInteraction, MessageActionRow, MessageSelectMenu, MessageButton, MessageComponentInteraction, SelectMenuInteraction, DiscordAPIError } = require('discord.js');
const { Command } = require('../../types/command');
const { CmdMessageResponse, ComMessageResponse, CallbackType, MessageComponent, ButtonStyle } = require('../../util/interactions');
const StringUtils = require('../../util/stringutils');
const config = require('../../config.json');
const EduTeacher = require('../../types/edu/eduteacher');
const EduStudent = require('../../types/edu/edustudent');
const { sendEmailVerification } = require('../../util/verification');

class IdentifyCommand extends Command {
	constructor(client) {
		super(client, {
			id: `863048381727637574`,
			name: `identify`,
			group: `misc`,
			memberName: `identify`,
			description: `I am...`,
			examples: [`identify student firstname lastname`, `identify teacher email teacher`],
			components: [
				`identify_class_select`,
				`identify_authorize_allow`,
				`identify_authorize_deny`,
				`identify_select_teacher`,
				`identify_select_guest`,
				`identify_select_student`,
				`identify_pick_user`,
				`identify_enter_id`,
			],
		});

		this.components = {
			classSelector: () => (
				new MessageSelectMenu(
					{
						customId: 'identify_class_select',
						placeholder: 'Vyber si triedu',
						minValues: 1, maxValues: 1,
						options: [
							config.classRoles.map(role => ({
								label: role.name,
								value: role.value,
								emoji: role.emoji ?? null,
							})),
						],
					},
				)
			),
			roleSelectionButtons: {
				teacher: () => (
					new MessageButton(
						{
							style: 'SECONDARY',
							customId: `identify_select_teacher`,
							emoji: '🧑‍🏫',
							label: 'Som učiteľ',
						},
					)
				),
				guest: () => (
					new MessageButton(
						{
							style: 'SECONDARY',
							customId: `identify_select_guest`,
							emoji: '🧑',
							label: 'Som hosť',
						},
					)
				),
				student: () => (
					new MessageButton(
						{
							style: 'PRIMARY',
							customId: `identify_select_student`,
							emoji: '🧑‍🎓',
							label: 'Som žiak',
						},
					)
				),
			},
			identifyDocButton: () => (
				new MessageButton(
					{
						style: 'LINK',
						url: 'https://api.felixbot.antala.tk/go/identify-authorization',
						label: 'What is this?',
						emoji: '❓',
					},
				)
			),
			notSureUserButton: () => (
				new MessageButton(
					{
						style: 'SECONDARY',
						customId: `identify_enter_id/notsure`,
						label: 'Nie som si istý',
						emoji: '🤷',
					},
				)
			),
			identifyManuallyButton: () => (
				new MessageButton(
					{
						style: 'SECONDARY',
						customId: `identify_enter_id/manually`,
						label: 'Identifikujem sa manuálne',
						emoji: '⌨️',
					},
				)
			),
			/**
			 * @param {[]} matches
			 * @returns
			 */
			userListSelectMenu: (matches) => (
				new MessageSelectMenu(
					{
						customId: `identify_pick_user`,
						minValues: 1, maxValues: 1,
						options: matches.map((m, i) => ({
							label: `Žiak ${i}`,
							value: m.id,
						})),
					},
				)
			),
			thisIsMeButton: (eusr) => (
				new MessageButton(
					{
						style: 'SUCCESS',
						label: 'Som to ja',
						customId: `identify_pick_user/${eusr.id}`,
						emoji: '🙋',
					},
				)
			),
			notMeButton: () => (
				new MessageButton(
					{
						style: 'DANGER',
						customId: `identify_enter_id/notme`,
						label: 'Nie som to ja',
						emoji: '🙅',
					},
				)
			),
			howToManuallyIdentify: () => (
				new MessageButton(
					{
						style: 'LINK',
						emoji: '📖',
						label: 'Ako sa identifikovať manuálne',
						url: 'https://api.felixbot.antala.tk/go/id-manually',
					},
				)
			),
		};
	}

	/**
	 * @param {CommandInteraction} interaction
	 * @returns
	 */
	async run(interaction) {
		const EDU = this.client.edupageManager;
		const DB = this.client.databaseManager;
		const guild = interaction.guild || this.client.guilds.resolve(config.guild);
		const user = interaction.user;
		const member = interaction.member ?? guild.members.resolve(user);
		const opts = interaction.options;
		const subcmd = opts.getSubCommand();

		if (!member) return await interaction.reply({ ephemeral: true, content: `Nie si členom tohto Discord serveru!` });

		const dbm = await DB.getMember(user.id) || await DB.getTeacher(user.id);
		if (dbm) return await interaction.reply({ ephemeral: true, content: 'Už si sa raz identifikoval/a.\nAk chceš niečo zmeniť, napíš, prosím svojmu triednemu učiteľovi.' });


		if (subcmd === 'student') {
			const args = opts.get('student').options;
			const fname = StringUtils.capitalizeFirstLetter(args[0].value);
			const lname = StringUtils.capitalizeFirstLetter(args[1].value);
			/** @type {string?} */
			const eduid = args[2] && args[2].value;

			if (eduid) {
				const id = Array.from(eduid.matchAll('[0-9]')).map(o => o[0]).join('');
				const eusr = EDU.students.find(s => s.id === id);
				if (!eusr) return await interaction.reply({ ephemeral: true, content: `Študent s takýmto identifikátorom neexistuje.` });


			}
		}
		else if (subcmd === 'teacher') {

		}
		else if (subcmd === 'guest') {

		}




		/*
		if (eduid) {
			let id;
			if (typeof eduid === 'number') {
				id = String(eduid);
			}
			else if (typeof eduid === 'string') {
				id = Array.from(eduid.matchAll('[0-9]')).map(o => o[0]).join('');
			}

			let type;
			const usr = (EDU.teachers.find(t => t.id == id) && (type = 'Ucitel')) || (EDU.students.find(s => s.id == id) && (type = 'Student'));
			if (!usr) return await interaction.reply({ ephemeral: true, content: `Nenašiel som používateľa s ID ${id}` });

			if (type === 'Ucitel') {

			}
			else if (type === 'Student') {

			}
		}

		return; */
	}

	/**
	 *
	 * @param {GuildMember} member
	 * @param {Object} props
	 * @param {string} [props.name]
	 * @param {import('discord.js').RoleResolvable} [props.role]
	 * @param {string} [props.email]
	 * @param {import('../../util/parsers').VerificationLevel} [props.vrf]
	 * @param {EduStudent | EduTeacher} eusr
	 */
	async exec(member, { email, name, role, vrf }, eusr) {
		const DB = this.client.databaseManager;
		let n, r, db, m;

		if (eusr instanceof EduStudent) {
			if (!vrf) vrf = 'PENDING';
			db = await DB.insertMember({
				eusr,
				member,
				role: role.id ?? role,
				verification: vrf,
			});
		}
		else if (eusr instanceof EduTeacher) {
			if (!vrf) vrf = 'VERIFY_EMAIL';
			db = await DB.insertTeacher({
				member,
				email,
				eusr,
			});
		}
		else {
			if (!vrf && email) vrf = 'VERIFY_EMAIL';
			else if (!vrf) vrf = 'VERIFY_TEACHER';
			db = await DB.insertMember({
				eusr,
				member,
				role,
				verification: vrf,
			});
		}

		if (name) {
			try {
				n = await member.setNickname(name, 'Automatic identification process');
			}
			catch {
				n = false;
			}
		}
		if (role && (vrf != 'VERIFY_EMAIL' || vrf != 'VERIFY_TEACHER')) {
			try {
				r = await member.roles.add(role, 'Automatic identification process');
			}
			catch {
				r = false;
			}
		}

		if (vrf === 'VERIFY_EMAIL') {
			const sent = await sendEmailVerification(email, member.displayName, { userid: member.id });
			if (sent.accepted.length > 0) m = true;
			else m = false;
		}

		return { n, r, db, m };
	}

	/**
	 * @param {MessageComponentInteraction} interaction
	 * @returns
	 */
	async component(interaction) {
		const EDU = this.client.edupageManager;
		const split = interaction.customId.split('/');
		const id = split[0];
		const args = split.slice(1);
		const guild = interaction.guild ?? this.client.guilds.resolve(config.guild);

		if (id === 'identify_class_select' && interaction.isSelectMenu()) {
			const member = interaction.member ?? guild.members.resolve(interaction.user);
			if (!member) return await interaction.reply({ ephemeral: true, content: 'Prepáč, ale už nie si členom Felix Discordu.' });

			const role_id = interaction.values[0];
			// if (config.classRoles.find(r => r.value === role_id).confirm === true) {
			// 	/** @type {TextChannel} */
			// 	const channel = guild.channels.resolve(config.authorizationChannel);
			// 	const hooks = await channel.fetchWebhooks();
			// 	const embed = new MessageEmbed({ author: { name: member.displayName, iconURL: member.user.avatarURL() } });
			// 	const role = guild.roles.resolve(role_id);
			// 	embed.setTitle(`Authorize user identification`).setColor('ff0000').setTimestamp(new Date())
			// 		.addField('Who', `${member.displayName} (${member.user.username}#${member.user.discriminator}) has self-identified as <@&${role.id}>.`)
			// 		.addField('Why', `As this is a role that grants a high amount of access, an authorized person needs to confirm this action.`)
			// 		.addField('Action', `Authorize or forbid this action using the buttons below.`)
			// 		.setFooter('Authorization pending...');

			// 	const components = [
			// 		MessageComponent.actionRow(
			// 			MessageComponent.button(
			// 				ButtonStyle.Success, { label: 'Authorize', emoji: { name: '✅' } }, `identify_authorize_allow/${member.id}/${role.id}`,
			// 			),
			// 			MessageComponent.button(
			// 				ButtonStyle.Destructive, { label: 'Forbid', emoji: { name: '❌' } }, `identify_authorize_deny/${member.id}/${role.id}`,
			// 			),
			// 			MessageComponent.button(
			// 				ButtonStyle.Link, { label: 'What is this?', emoji: { name: '❓' } }, null, 'https://api.felixbot.antala.tk/go/identify-authorization',
			// 			),
			// 		),
			// 	];
			// 	let hook = hooks.find(h => h.name === `Felix Identity Authorization`);
			// 	if (!hook) hook = await channel.createWebhook(`Felix Identity Authorization`);
			// 	hook.send({ embeds: [embed], components });

			// 	pendingIdentification.push(member.id);
			// 	const response = ComMessageResponse(`Identifikoval si sa ako ${role.name}. Táto rola ale potrebuje potrvdenie. \nProsím počkaj, kým učiteľ prijme alebo zamietne tvoju žiadosť.`, true);
			// 	response.data.components = [];
			// 	return response;
			// }
			// else {
			await member.roles.add(role_id, 'Automatic identification process');
			await interaction.reply({ ephemeral: true, content: 'Úspešne som ti nastavil prístupové práva.' });
			return;
			// }
		}
		else if (id === `identify_authorize_allow`) {
			const member = guild.members.resolve(args[0]);
			/** @type {TextChannel} */
			const message = interaction.message;
			const allowedBy = interaction.member;
			const embed = new MessageEmbed(message.embeds[0]);
			member.roles.add(args[1], `Automatic identification process, authorized by ${allowedBy.displayName}`);
			member.send(`${allowedBy.displayName} (${allowedBy.user.username}#${allowedBy.user.discriminator}) akceptoval/a tvoju žiadosť.`);
			embed.setFooter(`Authorized by ${allowedBy.displayName}`).spliceFields(2, 1).addField('Authorized', `<@${allowedBy.id}> authorized this action at ${new Date().toLocaleString('en-GB')}.`);
			await interaction.message.edit({
				embeds: [embed],
				components: [
					new MessageActionRow()
						.addComponents(this.components.identifyDocButton()),
				],
			});
			return;
		}
		else if (id === `identify_authorize_deny`) {
			const member = guild.members.resolve(args[0]);
			const message = interaction.message;
			const forbiddenBy = interaction.member;
			const embed = new MessageEmbed(message.embeds[0]);
			member.send(`${forbiddenBy.displayName} (${forbiddenBy.user.username}#${forbiddenBy.user.discriminator}) zamietol/la tvoju žiadosť.`);
			embed.setFooter(`Forbidden by ${forbiddenBy.displayName}`).spliceFields(2, 1).addField('Forbidden', `<@${forbiddenBy.id}> forbid this action at ${new Date().toLocaleString('en-GB')}.`);
			await interaction.message.edit({
				embeds: [embed],
				components: [
					new MessageActionRow()
						.addComponents(this.components.identifyDocButton()),
				],
			});
			return;
		}
		else if (id.includes(`identify_select`)) {
			const member = interaction.member || guild.members.resolve(interaction.user);
			if (!member) return await interaction.reply({ ephemeral: true, content: 'Prepáč, ale už nie si členom Felix Discordu.' });
			const name = StringUtils.removeStartingDot(member.displayName);
			const names = name.split(' ');
			const initials = (names[names.length - 1].charAt(0) + names[0].charAt(0)).toLocaleUpperCase();
			if (id === `identify_select_student`) {
				const studentMatches = EDU.students.filter(s => s.short == initials);
				if (studentMatches.length === 0) {
					await interaction.update({
						components: [
							new MessageActionRow()
								.addComponents(
									this.components.roleSelectionButtons.student()
										.setDisabled(true)
										.setStyle('DANGER'),
								),
						],
					});

					await interaction.followUp({
						content: `V školskom EduPage som nenašiel žiadneho žiaka zhodujúceho sa s daným menom.\nSi si istý, že si zadal správne meno? Ak áno, môžeš sa identifikovať aj manuálne. Ak nie, spusti príkaz odznova.`,
						components: [
							new MessageActionRow()
								.addComponents(this.components.identifyManuallyButton()),
						],
					});
					return;
				}
				else {
					const embed = new MessageEmbed();
					embed.setTitle('Zoznam zhôd');
					embed.setDescription(`Zoznam žiakov s iniciálami: "${initials}"`);
					embed.addFields(
						studentMatches.map((match, i) => ({
							name: `Žiak ${i}`,
							value: `Edupage ID: ${match.id}\nTrieda: ${match.class.name}\nSkupiny: ${match.groups.map(g => g.name).join(', ')}`,
							inline: true,
						})),
					);
					embed.setTimestamp();
					embed.setFooter(`Ak si nie si úplne istý/á stlač 'nie som si istý'`);

					await interaction.update({
						components: [
							new MessageActionRow()
								.addComponents(
									this.components.roleSelectionButtons.student()
										.setDisabled(true)
										.setStyle('SUCCESS'),
								),
						],
					});

					await interaction.followUp({
						content: `V školskom EduPage som našiel nasledujúcich študentov s iniciálami '${initials}'\nProsím, vyber seba.`,
						embeds: [embed],
						components: [
							new MessageActionRow()
								.addComponents(this.components.userListSelectMenu(studentMatches)),
							new MessageActionRow()
								.addComponents(this.components.notSureUserButton()),
						],
					});
					return;
				}
			}
			else if (id === `identify_select_teacher`) {
				const teacherMatch = EDU.teachers.filter(t => t.short == initials);
				const embed = new MessageEmbed();
				embed.setTitle('Zoznam zhôd');
				embed.setTimestamp();
				embed.setFooter('Ak ešte nie si v školskom EduPage systéme, nemôžeš sa identifikovať.');

				if (teacherMatch.length === 1) {
					const match = teacherMatch[0];
					const subjects = EDU.lessons.filter(l => l.teacher.id === match.id).map(l => l.subject.short).join(', ');
					embed.setDescription(`Našiel som 1 učiteľa s iniciálami: "${initials}"`);
					embed.addField('Učiteľ', `EduPage ID: ${match.id}\nPohlavie: ${match.gender || 'nezadané'}\nPredmety: ${subjects}`);

					await interaction.update({
						components: [
							new MessageActionRow()
								.addComponents(
									this.components.roleSelectionButtons.teacher()
										.setDisabled(true)
										.setStyle('SUCCESS'),
								),
						],
					});

					await interaction.followUp({
						content: `V školskom EduPage som našiel nasledujúceho učiteľa zhodujúceho sa s Tvojimi iniciálmi.`,
						embeds: [embed],
						components: [
							new MessageActionRow()
								.addComponents(
									this.components.thisIsMeButton(match),
									this.components.notMeButton(),
								),
						],
					});
					return;
				}
				else {
					await interaction.update({
						components: [
							new MessageActionRow()
								.addComponents(
									this.components.roleSelectionButtons.teacher()
										.setDisabled(true)
										.setStyle('DANGER'),
								),
						],
					});

					await interaction.followUp({
						content: `V školskom EduPage som ${teacherMatch.length === 0 ? 'nenašiel žiadneho učiteľa zhodujúceho' : 'našiel viacero učiteľov zhodujúcich'} sa s Tvojimi iniciálmi.\nProsím, identifikuj sa manuálne.`,
						components: [
							new MessageActionRow()
								.addComponents(this.components.identifyManuallyButton()),
						],
					});
					return;
				}
			}
			else if (id === `identify_select_guest`) {
				// TODO
			}
		}
		else if (id === `identify_pick_user` && interaction.isSelectMenu()) {
			const member = interaction.member ?? guild.members.resolve(interaction.user);
			if (!member) return await interaction.reply({ ephemeral: true, content: 'Prepáč, ale už nie si členom Felix Discordu.' });

			const eduid = interaction.values[0];
			const eduStudent = EDU.students.find(s => s.id === eduid);
			const role = eduStudent.class.role;
			await member.roles.add(role);
			const DB = this.client.databaseManager;
			await DB.insertMember({ member, eusr: eduStudent, verification: 'PENDING', role });
			await interaction.update({ components: [], embeds: [], content: `Super! Úspešne som ťa zaradil ako ${member.displayName}, ${role.name}, EduPage ID ${eduStudent.id}` });
			return;
		}
		else if (id === `identify_pick_user` && interaction.isButton()) {
			const member = interaction.member ?? guild.members.resolve(interaction.user);
			if (!member) return await interaction.reply({ ephemeral: true, content: 'Prepáč, ale už nie si členom Felix Discordu.' });

			const eduid = args[0];
			const eduTeacher = EDU.teachers.find(t => t.id === eduid);
			await member.roles.add(config.teacherrole);
			const DB = this.client.databaseManager;
			await DB.insertTeacher({ member, eusr: eduTeacher });
			await interaction.update({ components: [], embeds: [], content: `Super! Úspešne som ťa zaradil ako ${member.displayName}, Učiteľ, EduPage ID ${eduTeacher.id}` });
			return;
		}
		else if (id === `identify_enter_id`) {
			// TODO
			const state = args[0];
			await interaction.reply({
				content: 'Prosím, nájdi v EduPage svoj identifikátor a spusti `/identify` s ním.',
				components: [
					new MessageActionRow()
						.addComponents(
							this.components.howToManuallyIdentify()
								.setLabel('Ako nájdem svoj identifikátor?'),
						),
				],
			});
			return;
		}
	}
}

module.exports = IdentifyCommand;