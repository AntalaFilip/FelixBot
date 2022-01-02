const { GuildMember, CommandInteraction } = require('discord.js');
const { Command } = require('../../types/command');

class SendWelcomeCommand extends Command {
	constructor(client) {
		super(client, {
			id: `863016170398810132`,
			name: `sendwelcome`,
			group: `misc`,
			memberName: `sendwelcome`,
			description: `Sends a welcome message to the specified member`,
			examples: [`sendwelcome 702922217155067924`],
		});
	}

	/**
	 * @param {CommandInteraction} interaction
	 */
	async run(interaction) {
		const guild = interaction.guild;
		const args = interaction.options;
		const user = args.get('user').user;
		const member = guild.members.resolve(user);
		if (member) {
			await this.exec(member);
			return await interaction.reply({ ephemeral: true, content: `Sent welcome to ${member.displayName}` });
		}
		else {
			return await interaction.reply({ ephemeral: true, content: `Failed to fetch this user` });
		}
	}

	/**
	 * Executes the SendWelcome command with the specified member
	 * @param {GuildMember} member
	 */
	async exec(member) {
		await member.send(
			`Ahoj! Vitaj vo FELIX Discorde!
	Je potrebné aby si sa identifikoval/a.
	Môžeš tak urobiť pomocou príkazu \`/identify\` - jednoducho mi ho pošli sem do správy a postupuj podľa pokynov.
	Dbaj prosím na diakritiku v svojom mene.
	(Táto správa bola vygenerovaná automaticky, pri problémoch kontaktujte našich administrátorov (support@felixbot.ahst.sk))`,
		);
		this.client.logger.info(`Sent welcome message to: ${member.displayName}`);
	}
}

module.exports = SendWelcomeCommand;