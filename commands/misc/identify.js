const { GuildMember, Role, TextChannel, MessageEmbed, CommandInteraction } = require('discord.js');
const { Command } = require('../../types/command');
const { CmdMessageResponse, ComMessageResponse, CallbackType, MessageComponent, ButtonStyle } = require('../../util/interactions');
const StringUtils = require('../../util/stringutils');
const config = require('../../config.json');

const classSelector = MessageComponent.actionRow(
	MessageComponent.select(
		'identify_role_select',
		'Trieda',
		null, null,
		config.availableRoles.map(role => MessageComponent.selectOpt(
			role.name,
			role.value,
		)),
	),
);

class IdentifyCommand extends Command {
	constructor(client) {
		super(client, {
			id: `863048381727637574`,
			name: `identify`,
			group: `misc`,
			memberName: `identify`,
			description: `I am...`,
			examples: [`identify firstname lastname class`, `identify meno priezvisko trieda`],
			throttling: { duration: 60, usages: 2 },
			components: [`identify_role_select`, `identify_authorize_allow`, `identify_authorize_deny`],
		});
	}

	/**
	 * @param {CommandInteraction} interaction
	 * @returns
	 */
	async run(interaction) {
		const guild = this.client.guilds.cache.find(gld => gld.id === `702836521622962198`);
		const user = interaction.user;
		const member = guild.members.resolve(user);

		if (!member) return await interaction.reply({ ephemeral: true, content: `Nie si členom tohto Discord serveru!` });

		if (pendingIdentification.includes(member.id)) return CmdMessageResponse(`Už si sa raz identifikoval, počkaj kým bude tvoja žiadosť schválená alebo odmietnutá.`);
		if (member.roles.cache.size > 1) return CmdMessageResponse(`Prepáč, ale už máš pridelenú triedu.`, true);
		const fname = StringUtils.capitalizeFirstLetter(interaction.data.options[0].value);
		const lname = StringUtils.capitalizeFirstLetter(interaction.data.options[1].value);

		await member.setNickname(fname + ' ' + lname, 'Automatic identification process');
		const response = {
			"type": CallbackType.CHANNEL_MESSAGE,
			"data": {
				"content": "Úspešne som ti nastavil meno. Prosím, vyber si svoju triedu zo zoznamu.",
				"flags": 64,
				"components": [
					classSelector,
				],
			},
		};

		return response;
	}

	async component(rawid, interaction) {
		const split = rawid.split('/');
		const id = split[0];
		const args = split.slice(1);
		const guild = this.client.guilds.cache.find(g => g.id === config.guild);
		if (id === 'identify_role_select') {
			const member = guild.members.resolve(interaction.user ? interaction.user.id : interaction.member.user.id);
			if (!member) return ComMessageResponse('Prepáč, ale niekde nastala chyba. Skús napísať administrátorovi.', true);

			const role_id = interaction.data.values[0];
			if (config.availableRoles.find(r => r.value === role_id).confirm === true) {
				/** @type {TextChannel} */
				const channel = guild.channels.resolve(config.authorizationChannel);
				const hooks = await channel.fetchWebhooks();
				const embed = new MessageEmbed({ author: { name: member.displayName, iconURL: member.user.avatarURL() } });
				const role = guild.roles.resolve(role_id);
				embed.setTitle(`Authorize user identification`).setColor('ff0000').setTimestamp(new Date())
					.addField('Who', `${member.displayName} (${member.user.username}#${member.user.discriminator}) has self-identified as <@&${role.id}>.`)
					.addField('Why', `As this is a role that grants a high amount of access, an authorized person needs to confirm this action.`)
					.addField('Action', `Authorize or forbid this action using the buttons below.`)
					.setFooter('Authorization pending...');

				const components = [
					MessageComponent.actionRow(
						MessageComponent.button(
							ButtonStyle.Success, { label: 'Authorize', emoji: { name: '✅' } }, `identify_authorize_allow/${member.id}/${role.id}`,
						),
						MessageComponent.button(
							ButtonStyle.Destructive, { label: 'Forbid', emoji: { name: '❌' } }, `identify_authorize_deny/${member.id}/${role.id}`,
						),
						MessageComponent.button(
							ButtonStyle.Link, { label: 'What is this?', emoji: { name: '❓' } }, null, 'https://felixbot.antala.tk/go/identify-authorization',
						),
					),
				];
				let hook = hooks.find(h => h.name === `Felix Identity Authorization`);
				if (!hook) hook = await channel.createWebhook(`Felix Identity Authorization`);
				hook.send({ embeds: [embed], components });

				pendingIdentification.push(member.id);
				const response = ComMessageResponse(`Identifikoval si sa ako ${role.name}. Táto rola ale potrebuje potrvdenie. \nProsím počkaj, kým učiteľ prijme alebo zamietne tvoju žiadosť.`, true);
				response.data.components = [];
				return response;
			}
			else {
				await member.roles.add(role_id, 'Automatic identification process');
				const response = ComMessageResponse('Úspešne som ti nastavil prístupové práva.', true);
				response.data.components = [];
				return response;
			}
		}
		else if (id === `identify_authorize_allow`) {
			const member = guild.members.resolve(args[0]);
			/** @type {TextChannel} */
			const channel = guild.channels.resolve(interaction.message.channel_id);
			const message = await channel.messages.fetch(interaction.message.id);
			const allowedBy = guild.members.resolve(interaction.member.user.id);
			const embed = new MessageEmbed(message.embeds[0]);
			member.roles.add(args[1], `Automatic identification process, authorized by ${allowedBy.displayName}`);
			member.send(`${allowedBy.displayName} (${allowedBy.user.username}#${allowedBy.user.discriminator}) akceptoval/a tvoju žiadosť.`);
			embed.setFooter(`Authorized by ${allowedBy.displayName}`).spliceFields(2, 1).addField('Authorized', `<@${allowedBy.id}> authorized this action at ${new Date().toLocaleString('en-GB')}.`);
			return {
				"type": CallbackType.UPDATE_MESSAGE,
				"data": {
					embeds: [
						embed.toJSON(),
					],
					components: [
						MessageComponent.actionRow(
							MessageComponent.button(
								ButtonStyle.Link, { label: 'What is this?', emoji: { name: '❓' } }, null, 'https://felixbot.antala.tk/go/identify-authorization',
							),
						),
					],
				},
			};
		}
		else if (id === `identify_authorize_deny`) {
			const member = guild.members.resolve(args[0]);
			const channel = guild.channels.resolve(interaction.message.channel_id);
			const message = await channel.messages.fetch(interaction.message.id);
			const allowedBy = guild.members.resolve(interaction.member.user.id);
			const embed = new MessageEmbed(message.embeds[0]);
			member.send(`${allowedBy.displayName} (${allowedBy.user.username}#${allowedBy.user.discriminator}) zamietol/la tvoju žiadosť.`);
			embed.setFooter(`Forbidden by ${allowedBy.displayName}`).spliceFields(2, 1).addField('Forbidden', `<@${allowedBy.id}> forbid this action at ${new Date().toLocaleString('en-GB')}.`);
			return {
				"type": CallbackType.UPDATE_MESSAGE,
				"data": {
					embeds: [
						embed.toJSON(),
					],
					components: [
						MessageComponent.actionRow(
							MessageComponent.button(
								ButtonStyle.Link, { label: 'What is this?', emoji: { name: '❓' } }, null, 'https://felixbot.antala.tk/go/identify-authorization',
							),
						),
					],
				},
			};
		}
	}
}

module.exports = IdentifyCommand;