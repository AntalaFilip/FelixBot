const { MessageEmbed } = require("discord.js");
const commando = require(`discord.js-commando`);

module.exports = class TeachCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: `teach`,
			group: `lesson`,
			memberName: `teach`,
			description: `Starts the specified lesson`,
			examples: [ `lesson start SJL`, `lesson end INF` ],
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
		// message.say(`${args.state.charAt(0).toUpperCase() + args.state.slice(1)}ed ${args.name.toUpperCase()}`);
		const lessons = this.client.lessons;
		const teacher = message.member;
		const teacherName = teacher.nickname || message.author.username;
		const teacherId = message.author.id;
		if (args.name !== `end`) {
			if (message.member.voice.channel) {
				const lesson = args.name;
				const classId = message.member.voice.channel.name.slice(0, 2);
				const lessonId = `${classId}-${lesson}-${teacherId}`;
				const channel = teacher.voice.channel;
				const date = new Date();
				const mstime = new Date().getTime();

				lessons.set(lessonId, {
					textchannel: message.channel,
					class: classId,
					lesson: lesson,
					teacher: teacher,
					teacherName: teacherName,
					teacherPresent: true,
					endMessageId: null,
					students: [],
					startedAt: {
						date: `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`,
						time: `${date.getHours()}:${date.getMinutes()}`,
						mstime: mstime,
					},
					period: null,
					embedmsg: null,
				});
				const crntlsn = lessons.get(lessonId);
				for (const mem of channel.members) {
					if (mem === teacher) break;
					this.client.joinedLesson(mem[1], lessonId);
				}
				const embed = new MessageEmbed()
					.setColor(`#00ff00`)
					.setTitle(`Lesson started!`)
					.setAuthor(`${teacherName}`, `${teacher.user.avatarURL()}`)
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