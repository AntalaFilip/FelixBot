const { GuildMember, Role } = require('discord.js');
const { Command, CommandoMessage } = require('discord.js-commando');

class IAmCommand extends Command {
	constructor(client) {
		super(client, {
			name: `iam`,
			group: `dev`,
			memberName: `iam`,
			description: `I am...`,
			examples: [ `iam firstname lastname class`, `iam meno priezvisko trieda` ],
			args: [
				{
					key: `fname`,
					prompt: `Meno:`,
					type: `string`,
				},
				{
					key: `lname`,
					prompt: `Priezvisko:`,
					type: `string`,
				},
				{
					key: `cls`,
					prompt: `Trieda:`,
					type: `string`,
					oneOf: [`plameniaky`, `sovy`, `vydry`, `vážky`, `koaly`, `pandy`],
				},
			],
			throttling: { duration: 60, usages: 2 },
		});
	}

	/**
	 * Runs the IAm command with the specified Message and arguments
	 * @param {CommandoMessage} message
	 * @param {{fname: string, lname: string, cls: string}} args
	 */
	run(message, args) {
		const user = message.author;
		const guild = this.client.guilds.cache.find(gld => gld.id === `702836521622962198`);
		const member = guild.member(user);
		if (message.guild) return message.delete();
		if (member.roles.cache.size > 1) return message.reply(`Prepáč, ale už máš pridelenú triedu.`);
		if (member) {
			const fname = args.fname.charAt(0).toUpperCase() + args.fname.slice(1).toLowerCase();
			const lname = args.lname.charAt(0).toUpperCase() + args.fname.slice(1).toLowerCase();
			const role = guild.roles.cache.find(val => val.name === args.cls);

			this.exec(member, fname + ' ' + lname, role)
				.then(message.reply(`Ďakujem! Úspešne som Ti priradil triedu! Teraz si bež užívať FELIX Discord! :D`))
				.catch(message.reply(`Prepáč, niečo sa pokazilo. Predsa len napíš niektorému administrátorovi`));
		}
	}

	/**
	 * Executes the IAm command on the member
	 * @param {GuildMember} member The member to execute the action on
	 * @param {String} name The name to set to the member
	 * @param {Role} role The role to set to the member
	 */
	async exec(member, name, role) {
		const setnick = await member.setNickname(name);
		const roles = await member.roles.add(role);
		if (setnick && roles) return Promise.resolve();
		Promise.reject();
	}
}

module.exports = IAmCommand;