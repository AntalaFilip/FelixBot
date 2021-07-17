const { GuildMember } = require('discord.js');
const { Command } = require('../../types/command');
const { CmdMessageResponse } = require('../../util/interactions');

class SendWelcomeCommand extends Command {
	constructor(client) {
		super(client, {
			id: `863016170398810132`,
			name: `sendwelcome`,
			group: `misc`,
			memberName: `sendwelcome`,
			description: `Sends a welcome message to the specified member`,
			examples: [ `sendwelcome 702922217155067924` ],
		});
	}

	/**
	 * Runs the SendWelcome command with the specified Message and arguments
	 * @param {CommandoMessage} message
	 * @param {any} args
	 */
	async run(interaction) {
		const guild = await this.client.guilds.fetch(interaction.guild_id);
		const user = interaction.data.options[0].value;
		const member = guild.members.cache.find(mem => mem.id === user);
		if (member) {
			this.exec(member);
			return CmdMessageResponse(`Sent welcome to ${member.displayName}`, true);
		}
		else {
			return CmdMessageResponse(`Failed to fetch this user`, true);
		}
	}

	/**
	 * Executes the SendWelcome command with the specified member
	 * @param {GuildMember} member
	 */
	exec(member) {
		member.createDM()
			.then(dm => {
				dm.send(`Ahoj! Vitaj vo FELIX Discorde!`);
				dm.send(`Prosím Ťa, napíš svoje meno, priezvisko a triedu jednému z našich administrátorov (Filip Antala, Mati Halák, Zuzka Burjanová) aby Ťa mohli zaradiť do tvojej triedy.`);
				dm.send(`Ak sa Ti ale nechce písať administrátorovi (alebo žiaden práve nie je online), môžeš napísať meno a triedu aj mne nasledovne (prosím, používaj diakritiku):`);
				dm.send(`/identify TvojeMeno TvojePriezvisko`);
			});
		this.client.logger.info(`Sent welcome message to: ${member.displayName}`);
	}
}

module.exports = SendWelcomeCommand;