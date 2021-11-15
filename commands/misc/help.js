const { CommandInteraction, MessageEmbed } = require("discord.js");
const { Command } = require("../../types/command");

class HelpCommand extends Command {
	constructor(client) {
		super(client, {
			id: `909725270993408031`,
			name: 'Help',
			group: 'misc',
			memberName: 'help',
			description: 'Interactive help command',
		});
	}

	/**
	 * @param {CommandInteraction} interaction
	 */
	async run(interaction) {
		const embed = new MessageEmbed()
			.setColor('DARK_GOLD')
			.setFooter('Tento pomocník je v procese vyrábania a testovania, ešte v ňom nenájdete všetko.')
			.setTimestamp()
			.setTitle('Intereaktívny pomocník')
			.setDescription('Interaktívny pomocník vo Felix Discorde')
			.addFields([
				{
					name: 'Problém so zvukom',
					value: 'Pozri sa vľavo dole, k tvojmu profilu. Malo by ti tam písať zelené "... Connected". Ak tam máš dlhšie niečo iné, skús si reštartovať Discord a/alebo počítač.',
				},
				{
					name: 'Môj problém tu nie je',
					value: 'Určite napíš našim administrátorom (Filip A, Mati H) na Discord, alebo pošli mail na filip@felixmuzikal.sk',
				},
			]);
		interaction.reply({
			ephemeral: true,
			embeds: [embed],
		});
	}
}

module.exports = HelpCommand;