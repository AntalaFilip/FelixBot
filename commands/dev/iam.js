const commando = require(`discord.js-commando`);

module.exports = class IAmCommand extends commando.Command {
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

	run(message, args) {
		const user = message.author;
		const guild = this.client.guilds.cache.find(gld => gld.id === `702836521622962198`);
		const member = guild.member(user);
		if (message.guild) return message.delete();
		if (member.roles.cache.size > 1) return message.reply(`Prepáč, ale už máš pridelenú triedu.`);
		if (member) {
			member.setNickname(`${args.fname.charAt(0).toUpperCase() + args.fname.slice(1)} ${args.lname.charAt(0).toUpperCase() + args.lname.slice(1)}`)
				.then(mem => {
					mem.roles.add(guild.roles.cache.find(role => role.name === args.cls))
						.then(() => message.reply(`Ďakujem! Úspešne som Ti priradil triedu! Teraz si bež užívať FELIX Discord! :D`))
						.catch(() => message.reply(`Prepáč, niečo sa pokazilo. Predsa len napíš niektorému administrátorovi`));
				}).catch(() => message.reply(`Prepáč, niečo sa pokazilo. Predsa len napíš niektorému administrátorovi`));
		}
	}
};