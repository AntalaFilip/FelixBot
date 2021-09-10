const { GuildMember, TextChannel, MessageEmbed, CommandInteraction, MessageActionRow, MessageSelectMenu, MessageButton, MessageComponentInteraction } = require('discord.js');
const { Command } = require('../../types/command');
const StringUtils = require('../../util/stringutils');
const config = require('../../config.json');
const EduTeacher = require('../../types/edu/eduteacher');
const EduStudent = require('../../types/edu/edustudent');
const { sendEmailVerification } = require('../../util/verification');
const { capitalizeFirstLetter } = require('../../util/stringutils');
const latinise = require('../../util/latinize');

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
			userListSelectMenu: (matches, name) => (
				new MessageSelectMenu(
					{
						customId: `identify_pick_user/${name}`,
						placeholder: `Vyber seba`,
						minValues: 1, maxValues: 1,
						options: matches.map((m, i) => ({
							label: `Žiak ${i}`,
							value: m.id,
						})),
					},
				)
			),
			thisIsMeButton: (eusr, email) => (
				new MessageButton(
					{
						style: 'SUCCESS',
						label: 'Som to ja',
						customId: `identify_pick_user/${eusr.id}/${email}`,
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
			tvrf: {
				authorize: (member, role) => (
					new MessageButton({
						style: 'SUCCESS',
						customId: `identify_authorize_allow/${member.id}/${role.id || role}`,
						label: 'Authorize',
						emoji: '✅',
					})
				),
				forbid: (member, role) => (
					new MessageButton({
						style: 'DANGER',
						customId: `identify_authorize_deny/${member.id}/${role.id || role}`,
						label: 'Forbid',
						emoji: '❌',
					})
				),
				about: () => (
					new MessageButton({
						style: 'LINK',
						label: 'What is this?',
						emoji: '❓',
						url: 'https://api.felixbot.antala.tk/go/identify-authorization',
					})
				),
			},
		};
	}

	/**
	 * @param {CommandInteraction} interaction
	 * @returns
	 */
	async run(interaction) {
		if (interaction.guild) return await interaction.reply({ ephemeral: true, content: 'Tento príkaz môžeš použiť iba v privátnej správe' });
		/** @type {CommandInteraction} */
		// eslint-disable-next-line no-self-assign
		interaction = interaction;
		const EDUs = this.client.edupageManager;
		const DB = this.client.databaseManager;
		const guild = interaction.guild || this.client.guilds.resolve(config.guild);
		const user = interaction.user;
		const member = interaction.member ?? await guild.members.fetch(user);
		const opts = interaction.options;
		const subcmd = opts.getSubCommand();

		if (!member) return await interaction.reply({ ephemeral: true, content: `Nie si členom tohto Discord serveru!` });
		if (member.pending) return await interaction.reply({ ephemeral: true, content: `Najprv, prosím dokonči membership screening vo FELIX serveri.` });

		const dbm = await DB.getMember(user.id) || await DB.getTeacher(user.id);
		if (dbm) return await interaction.reply({ ephemeral: true, content: 'Už si sa raz identifikoval/a.\nAk chceš niečo zmeniť, napíš, prosím svojmu triednemu učiteľovi / administrátorovi.' });


		if (subcmd === 'student') {
			const args = opts.data[0].options;
			const fname = StringUtils.capitalizeFirstLetter(args[0].value);
			const lname = StringUtils.capitalizeFirstLetter(args[1].value);
			const initials = lname.charAt(0) + fname.charAt(0);
			/** @type {string?} */
			const eduid = args[2] && args[2].value;

			if (eduid) {
				const id = String(Array.from(eduid.matchAll('[0-9]')).map(o => o[0]).join(''));
				const eusr = EDUs.flatMap(e => e.students).find(s => s.id === id);
				if (!eusr) return await interaction.reply({ ephemeral: true, content: `Študent s takýmto identifikátorom neexistuje.` });

				const { msg } = await this.exec(member, { name: `${fname} ${lname}`, vrf: 'PENDING', role: eusr.class.role }, eusr);
				if (!msg) return await interaction.reply({ content: 'Úspešne som ti nastavil prístupové práva' });
				else {
					return await interaction.reply({ content: msg });
				}
			}

			const matches = EDUs.flatMap(e => e.students).filter(s => s.short === initials);

			if (matches.length === 0) {
				await interaction.reply({
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
					matches.map((match, i) => ({
						name: `Žiak ${i}`,
						value: `Edupage ID: ${match.id}\nTrieda: ${match.class.name}\nSkupiny: ${match.groups.map(g => g.name).join(', ')}`,
						inline: true,
					})),
				);
				embed.setTimestamp();
				embed.setFooter(`Ak si nie si úplne istý/á stlač 'nie som si istý'`);

				await interaction.reply({
					content: `V školskom EduPage som našiel nasledujúcich študentov s iniciálami '${initials}'\nProsím, vyber seba.`,
					embeds: [embed],
					components: [
						new MessageActionRow()
							.addComponents(this.components.userListSelectMenu(matches, `${fname} ${lname}`)),
						new MessageActionRow()
							.addComponents(this.components.notSureUserButton()),
					],
				});
				return;
			}
		}

		else if (subcmd === 'teacher') {
			const args = opts.data[0].options;
			const [{ value: email }, { value: type }, edu] = args;
			const eduid = edu && edu.value;

			if (!email.includes('@')) return interaction.reply({ ephemeral: true, content: 'Nesprávny formát emailu' });
			const mpart = email.split('@');

			const domain = mpart[1];
			if (domain != config.domain) return interaction.reply({ ephemeral: true, content: `Email musí byť tvoj pracovný (@${config.domain}) email` });

			const names = mpart[0].split('.').map(o => capitalizeFirstLetter(o));
			const initials = (names[1].charAt(0) + names[0].charAt(0)).toLocaleUpperCase();

			if (type === 'teacher' || type === 'leadership') {
				const leadership = (type === 'leadership');
				if (eduid) {
					const id = String(Array.from(eduid.matchAll('[0-9]')).map(o => o[0]).join(''));
					const eusr = EDUs.flatMap(e => e.teachers).find(t => t.id === id);
					if (!eusr) return await interaction.reply({ ephemeral: true, content: `Učiteľ s takýmto identifikátorom neexistuje.` });

					const { msg } = await this.exec(member, { vrf: 'VERIFY_EMAIL', email, role: leadership ? config.roles.leadership : config.roles.teacher }, eusr);
					if (msg) return await interaction.reply({ content: msg });
					await interaction.reply({ content: 'Odoslal som ti verifikačný email' });
					return;
				}
				const matches = EDUs.flatMap(e => e.teachers).filter(t => latinise(t.short) === latinise(initials));
				const embed = new MessageEmbed();
				embed.setTitle('Zoznam zhôd');
				embed.setTimestamp();
				embed.setFooter('Ak ešte nie si v školskom EduPage systéme, nemôžeš sa identifikovať.');

				if (matches.length === 1) {
					const match = matches[0];
					const subjects = match.subjects;
					embed.setDescription(`Našiel som 1 učiteľa s iniciálami: "${initials}"`);
					embed.addField('Učiteľ', `EduPage ID: ${match.id}\nPohlavie: ${match.gender || 'nezadané'}\nPredmety: ${subjects}\nEmail: ${email}`);

					await interaction.reply({
						content: `V školskom EduPage som našiel nasledujúceho učiteľa zhodujúceho sa s Tvojimi iniciálmi.`,
						embeds: [embed],
						components: [
							new MessageActionRow()
								.addComponents(
									this.components.thisIsMeButton(match, email),
									this.components.notMeButton(),
								),
						],
					});
					return;
				}
				else if (!leadership) {
					await interaction.reply({
						content: `V školskom EduPage som ${matches.length === 0 ? 'nenašiel žiadneho učiteľa zhodujúceho' : 'našiel viacero učiteľov zhodujúcich'} sa s Tvojimi iniciálmi (${initials}).\nProsím, identifikuj sa manuálne.`,
						components: [
							new MessageActionRow()
								.addComponents(this.components.identifyManuallyButton()),
						],
					});
					return;
				}
			}
			const role = guild.roles.resolve(config.roles[type]);
			const { msg } = this.exec(member, { email, role, name: names.join(' '), vrf: 'VERIFY_EMAIL' });
			if (msg) return await interaction.reply({ content: msg });
			await interaction.reply({ content: 'Poslal som ti verifikačný email' });
			return;
		}
		else if (subcmd === 'guest') {
			const args = opts.data[0].options;
			const type = args[0].value;

			if (type === 'exstudent') {
				const { msg } = await this.exec(member, { vrf: 'PENDING', role: config.roles.alumni });
				if (msg) return await interaction.reply({ content: msg });
				await interaction.reply('Úspešne som ti nastavil prístupové práva');
				return;
			}
			else if (type === 'lesson') {
				const { msg } = await this.exec(member, { vrf: 'VERIFY_TEACHER', role: config.roles.guest });
				if (msg) return await interaction.reply({ content: msg });
				await interaction.reply(`Odoslal som žiadosť o potvrdenie identifikácie, prosím počkaj, kým ju učiteľ príjme.`);
				return;
			}
		}
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
		role = member.guild.roles.resolve(role);
		const DB = this.client.databaseManager;
		let n, r, db, m, tv;

		if (eusr instanceof EduStudent) {
			if (!vrf) vrf = 'PENDING';
			db = await DB.insertMember({
				eusr,
				member,
				role,
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
		if (role && (vrf != 'VERIFY_EMAIL' && vrf != 'VERIFY_TEACHER')) {
			try {
				const toAdd = [role];
				if (eusr instanceof EduTeacher) {
					if (!toAdd.find(rl => rl.id === config.roles.teacher)) toAdd.push(config.roles.teacher);
					if (eusr.class && !toAdd.find(rl => (rl.id ?? rl) === eusr.class.role.id)) toAdd.push(eusr.class.role);
				}
				r = await member.roles.add(toAdd, 'Automatic identification process');
			}
			catch {
				r = false;
			}
		}

		if (vrf === 'VERIFY_EMAIL') {
			const sent = await sendEmailVerification(email, member.displayName, { userid: member.id, roleid: role.id });
			if (sent.accepted.length > 0) m = true;
			else m = false;
		}
		else if (vrf === 'VERIFY_TEACHER') {
			role = member.guild.roles.resolve(role);
			/** @type {TextChannel} */
			const channel = member.guild.channels.resolve(config.authorizationChannel);
			const hooks = await channel.fetchWebhooks();
			const embed = new MessageEmbed({ author: { name: member.displayName, iconURL: member.user.avatarURL() } });
			embed.setTitle(`Authorize user identification`).setColor('ff0000').setTimestamp(new Date())
				.addField('Who', `${member.displayName} (${member.user.username}#${member.user.discriminator}) has self-identified as <@&${role.id}>.`)
				.addField('Why', `As this is a role that grants a high amount of access, an authorized person needs to confirm this action.`)
				.addField('Action', `Authorize or forbid this action using the buttons below.`)
				.setFooter('Authorization pending...');

			let hook = hooks.find(h => h.name === `Felix Trust and Safety`);
			if (!hook) hook = await channel.createWebhook(`Felix Trust and Safety`, { reason: 'Identity verification' });
			try {
				await hook.send({
					embeds: [embed],
					components: [
						new MessageActionRow()
							.addComponents(
								this.components.tvrf.authorize(member, role),
								this.components.tvrf.forbid(member, role),
								this.components.tvrf.about(),
							),
					],
				});
				tv = true;
			}
			catch {
				tv = false;
			}
		}

		let msg;
		if (n === false || r === false || db === false || m === false) {
			msg = `Nepodarilo sa mi:\n`;
			if (n === false) msg += 'zmeniť ti meno (trochu zlé)\n';
			if (r === false) msg += 'nastaviť ti prístupové práva (dosť zlé)\n';
			if (m === false) msg += 'poslať ti verifikačný mail (dosť zlé, zadal/a si funkčný mail?)\n';
			if (tv === false) msg += 'odoslať žiadosť o potvrdenie identity (veľmi zlé)\n';
			if (db === false) msg += 'uložiť ťa do databázy (veľmi zlé)\n';
			msg += 'prosím, skús to ešte raz a ak problém pretrváva kontaktuj našich administrátorov';
		}

		return { n, r, db, m, tv, msg };
	}

	/**
	 * @param {MessageComponentInteraction} interaction
	 * @returns
	 */
	async component(interaction) {
		const EDUs = this.client.edupageManager;
		const split = interaction.customId.split('/');
		const id = split[0];
		const args = split.slice(1);
		const guild = interaction.guild ?? this.client.guilds.resolve(config.guild);
		if (id === `identify_authorize_allow`) {
			const member = guild.members.resolve(args[0]);
			/** @type {TextChannel} */
			const message = interaction.message;
			const allowedBy = interaction.member;
			const embed = new MessageEmbed(message.embeds[0]);
			await member.roles.add(args[1], `Automatic identification process, authorized by ${allowedBy.displayName}`);
			await this.client.databaseManager.updateMember(member.id, { verification: 'VERIFIED' });
			await member.send(`${allowedBy.displayName} (${allowedBy.user.username}#${allowedBy.user.discriminator}) akceptoval/a tvoju žiadosť.`);
			embed.setFooter(`Authorized by ${allowedBy.displayName}`).spliceFields(2, 1).addField('Authorized', `<@${allowedBy.id}> authorized this action at ${new Date().toLocaleString('en-GB')}.`);
			await interaction.update({
				embeds: [embed],
				components: [
					new MessageActionRow()
						.addComponents(this.components.identifyDocButton()),
				],
			});
			return;
		}
		else if (id === `identify_authorize_deny`) {
			const member = guild.members.resolve(args[0]) ?? guild.members.fetch(args[0]);
			const audits = guild.fetchAuditLogs({ type: 'MEMBER_KICK' });
			const message = interaction.message;
			const forbiddenBy = interaction.member;
			const embed = new MessageEmbed(message.embeds[0]);
			member.send(`${forbiddenBy.displayName} (${forbiddenBy.user.username}#${forbiddenBy.user.discriminator}) zamietol/la tvoju žiadosť.`);
			await member.kick(`Verification denied`);
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
		else if (id === `identify_pick_user` && interaction.isSelectMenu()) {
			const member = interaction.member ?? guild.members.resolve(interaction.user);
			if (!member) return await interaction.reply({ ephemeral: true, content: 'Prepáč, ale už nie si členom Felix Discordu.' });

			const eduid = interaction.values[0];
			const eduStudent = EDUs.flatMap(e => e.students).find(s => s.id === eduid);
			const role = eduStudent.class.role;
			await this.exec(member, { name: args[0], role, vrf: 'PENDING' }, eduStudent);
			await interaction.update({ components: [], embeds: [], content: `Super! Úspešne som ťa zaradil ako ${member.displayName}, ${role.name}, EduPage ID ${eduStudent.id}` });
			return;
		}
		else if (id === `identify_pick_user` && interaction.isButton()) {
			const member = interaction.member ?? guild.members.resolve(interaction.user);
			if (!member) return await interaction.reply({ ephemeral: true, content: 'Prepáč, ale už nie si členom Felix Discordu.' });

			const eduid = args[0];
			const eduTeacher = EDUs.flatMap(e => e.teachers).find(t => t.id === eduid);
			const { msg } = await this.exec(member, { email: args[1], role: config.roles.teacher, vrf: 'VERIFY_EMAIL' }, eduTeacher);
			if (msg) return interaction.update({ components: [], embeds: [], content: msg });
			await interaction.update({ components: [], embeds: [], content: `Poslal som ti verifikačný email.` });
			return;
		}
		else if (id === `identify_enter_id`) {
			await interaction.update({ components: [] });
			await interaction.followUp({
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