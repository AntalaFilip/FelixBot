const { MessageEmbed } = require("discord.js");
const commando = require(`discord.js-commando`);

module.exports = class TeachCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: `teach`,
			group: `lesson`,
			memberName: `teach`,
			description: `Starts the specified lesson`,
			examples: [ `teach sjl`, `teach end inf` ],
			guildOnly: true,
			userPermissions: [`MOVE_MEMBERS`, `MANAGE_CHANNELS`],
			args: [
				{
					key: `name`,
					prompt: `What lesson do you want to start? Use 'end' to end the current lesson`,
					type: `string`,
					oneOf: [`sjl`, `mat`, `anj`, `bio`, `chem`, `dej`, `fyz`, `geo`, `huv`, `inf`, `nej`, `obn`, `rk`, `end`],
				},
			],
		});
	}

	async run(message, args) {
		// Get the lessons map
		const lessons = this.client.lessons;
		// Get the teacher (member that instantiated the command)
		const teacher = message.member;
		// Get the teacher's name & ID
		const teacherName = teacher.nickname || message.author.username;
		const teacherId = message.author.id;
		// If the lesson is being started
		if (args.name !== `end`) {
			// If the teacher is in a channel
			if (teacher.voice.channel) {
				// Set the lesson type
				const lesson = args.name;
				// Get the voice channel
				const chan = teacher.voice.channel;
				// Get the class ID
				const clsid = chan.name.slice(0, 2);
				// Make a new lesson ID
				const lessonId = `${lesson}@${clsid}#${teacherId}`;
				// Create a new Date
				const date = new Date();
				// Check if there aren't lessons running already
				if (lessons.find(les => les.class === clsid)) return message.reply(`There is already a lesson ongoing in this class!`);
				if (lessons.find(les => les.teacher === teacher)) return message.reply(`You are still teaching a lesson! Type !teach end to end it!`);

				lessons.set(lessonId, {
					textchannel: message.channel,
					class: clsid,
					lesson: lesson,
					teacher: teacher,
					teacherName: teacherName,
					teacherPresent: true,
					students: [],
					startedAt: {
						date: `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`,
						time: `${date.getHours()}:${date.getMinutes()}`,
						mstime: date.getTime(),
					},
					period: this.client.period,
				});

				const crntlsn = lessons.get(lessonId);
				for (const mem of chan.members) {
					if (mem[1] === teacher) break;
					this.client.joinedLesson(mem[1], lessonId);
				}
				const embed = new MessageEmbed()
					.setColor(`#00ff00`)
					.setTitle(`Lesson started!`)
					.setAuthor(`${teacherName}`, teacher.user.avatarURL())
					.setDescription(`${lesson.toUpperCase()} has started, happy learning!`)
					.setThumbnail('https://cdn.discordapp.com/attachments/371283762853445643/768906541277380628/Felix-logo-01.png')
					.setTimestamp()
					.setFooter(`End the lesson by running !teach end`);
				crntlsn.embedmsg = await message.embed(embed);
			}
			else {
				message.reply(`You have to be in a voice channel!`);
			}
		}
		// Else if the lesson is being ended
		else if (args.name === `end`) {
			const key = lessons.findKey(usr => usr.teacher === teacher);
			if (key) {
				this.client.endLesson(key);
			}
			else {
				message.reply(`You do not have any ongoing lessons`).then(newmsg => newmsg.delete({ timeout: 10000 }));
				message.delete({ reason: `Invalid command` });
			}
		}
	}
};