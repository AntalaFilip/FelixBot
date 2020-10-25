const { Collection, MessageEmbed } = require("discord.js");
const commando = require(`discord.js-commando`);
const oneLine = require(`common-tags`).oneLine;
const path = require(`path`);
// const sqlite = require(`sqlite`);
const { token } = require(`./config.json`);

const client = new commando.CommandoClient({
	owner: `329957366042984449`,
	commandPrefix: `!`,
});
function watchStudent() {
	client.guilds.cache.find(gld => gld.id === `702836521622962198`).members.fetch().then(members => {
		const usr = members.random();
		if (usr.id != `702803698463801355` && usr.id != `702801293089177601`) client.user.setActivity(`${usr.nickname || usr.user.username}`, { type: `WATCHING` });
		setTimeout(() => { watchStudent(); }, 10000);
	});
}
client.lessons = new Collection();

client.sendWelcomeMessage = (member) => {
	member.createDM().then(dm => {
		dm.send(`Ahoj! Vitaj vo FELIX Discorde!`);
		dm.send(`Prosím Ťa, napíš svoje meno, priezvisko a triedu jednému z našich administrátorov (Filip Antala, Mati Halák, Zuzka Burjanová) aby Ťa mohli zaradiť do tvojej triedy.`);
		dm.send(`Ak sa Ti ale nechce písať administrátorovi (alebo žiaden práve nie je online), môžeš napísať meno a triedu aj mne nasledovne (prosím, používaj diakritiku):`);
		dm.send(`iam [Meno] [Priezvisko] [Trieda]`);
	});
	console.log(`Sent a welcome message to ${member.user.username}`);
};

client.endLesson = (lessonKey) => {
	const lesson = client.lessons.get(lessonKey);
	const students = lesson.students;
	const textchan = lesson.textchannel;
	const teacher = lesson.teacher;
	const publicembed = new MessageEmbed()
		.setColor(`#ff0000`)
		.setTitle(`Lesson ended!`)
		.setAuthor(`${lesson.teacherName}`, `${teacher.user.avatarURL()}`)
		.setDescription(`${lesson.lesson.toUpperCase()} has ended!`)
		.setThumbnail(`https://cdn.discordapp.com/attachments/371283762853445643/768906541277380628/Felix-logo-01.png`)
		.setTimestamp()
		.setFooter(`The lesson has ended!`);

	textchan.send(publicembed);
	const privateembed = new MessageEmbed()
		.setColor(`#ffff00`)
		.setTitle(`Summary of ${lesson.lesson.toUpperCase()}@${lesson.class.charAt(0).toUpperCase() + lesson.class.slice(1)}`)
		.setAuthor(`${client.user.username}`, `${client.user.avatarURL()}`)
		.setDescription(`The summary of ${lesson.lesson.toUpperCase()}@${lesson.class.charAt(0).toUpperCase() + lesson.class.slice(1)} lasting from ${lesson.startedAt.time} to ${new Date().getHours()}:${new Date().getMinutes()}`)
		.setThumbnail(`https://cdn.discordapp.com/attachments/371283762853445643/768906541277380628/Felix-logo-01.png`)
		.setTimestamp();

	console.log(`Size: ${students.length}`);
	for (let i = 0; i < students.length; i++) {
		console.log(`for privateembed ${i}`);
		const name = students[i].name;
		const atten = [];
		let joinedms = 0;
		let leftms = 0;
		for (let ii = 0; ii < students[i].attendance.joined.length; ii++) {
			console.log(`joined ${ii}`);
			joinedms = joinedms + students[i].attendance.joined[i];
		}
		for (let ii = 0; ii < students[i].attendance.left.length; ii++) {
			console.log(`left ${ii}`);
			leftms = leftms + students[i].attendance.left[i];
		}
		if (leftms == 0) leftms = new Date().getTime();
		let netms = 0;
		console.log(`j${joinedms} l${leftms}`);
		if (joinedms > leftms) netms = joinedms - leftms;
		else netms = leftms - joinedms;
		console.log(`push netms ${netms}`);
		const firstjoined = new Date(students[i].attendance.joined[0]);
		atten.push(`First joined at ${firstjoined.getHours()}:${firstjoined.getMinutes()}`);
		atten.push(`Total time: ${Math.round(netms / 60000)} min`);
		privateembed.addField(`${name}`, atten, true);
	}
	teacher.createDM().then(dm => dm.send(privateembed));
	client.lessons.delete(lessonKey);
};

client
	.on(`error`, console.error)
	.on(`warn`, console.warn)
	.on(`debug`, console.log)
	.on(`ready`, () => {
		console.log(`Ready; logged in as ${client.user.username}#${client.user.discriminator} (${client.user.id})`);
		watchStudent();
	})
	.on(`disconnect`, () => { console.warn(`Disconnected!`); })
	.on(`reconnecting`, () => { console.warn(`Reconnecting...`); })
	.on(`commandError`, (cmd, err) => {
		if(err instanceof commando.FriendlyError) return;
		console.error(`Error in ${cmd.groupID}:${cmd.memberName}`, err);
	})
	.on('commandBlocked', (msg, reason) => {
		console.log(oneLine`
			Command ${msg.command ? `${msg.command.groupID}:${msg.command.memberName}` : ''}
			blocked; ${reason}
		`);
	})
	.on('commandPrefixChange', (guild, prefix) => {
		console.log(oneLine`
			Prefix ${prefix === '' ? 'removed' : `changed to ${prefix || 'the default'}`}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`);
	})
	.on('commandStatusChange', (guild, command, enabled) => {
		console.log(oneLine`
			Command ${command.groupID}:${command.memberName}
			${enabled ? 'enabled' : 'disabled'}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`);
	})
	.on('groupStatusChange', (guild, group, enabled) => {
		console.log(oneLine`
			Group ${group.id}
			${enabled ? 'enabled' : 'disabled'}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`);
	})
	.on(`voiceStateUpdate`, (oldstate, newstate) => {
		const member = newstate.member;
		console.log(`${member.id} updated their voice state`);
		const oldchan = oldstate.channel;
		const newchan = newstate.channel;
		const lessons = client.lessons;
		// Does the old channel exist?
		if (oldchan) {
			const clsid = oldchan.name.slice(0, 2);
			const lesson = lessons.find(les => les.class === clsid);
			const lessonKey = lessons.findKey(les => les.class === clsid);
			// Is there an ongoing lesson in the old channel?
			if (lesson) {
				if (oldchan !== newchan) {
					if (newchan == null || newchan.name.slice(0, 2) !== clsid) {
						if (member == lesson.teacher) {
							lesson.teacherPresent = false;
							member.createDM().then(dm => {
								dm.send(`You disconnected from an ongoing lesson (${lesson.lesson.toUpperCase()}@${clsid.charAt(0).toUpperCase() + clsid.slice(1)})! Please reconnect or end the lesson (!teach end). The lesson is going to be ended automatically in 5 minutes`);
								setTimeout(() => {
									if (lessons.get(lessonKey)) {
										if (!lesson.teacherPresent) {
											dm.send(`The lesson (${lesson.lesson.toUpperCase()}@${clsid.charAt(0).toUpperCase() + clsid.slice(1)}) was ended due to you not being present for five minutes!`);
											client.endLesson(lessonKey);
										}
									}
								}, 3000);
							});
						}
						else {
							const student = lesson.students.find(map => map.id === member.id);
							student.attendance.left.push(new Date().getTime());
							console.log(`${student.name} (${student.id}) has left the lesson!`);
						}
					}
				}
			}
			// Does the new channel exist?
			if (newchan) {
				const clsidnew = newchan.name.slice(0, 2);
				const lessonnew = lessons.find(les => les.class === clsidnew);
				// Is there an ongoing leson in the new channel?
				if (lessonnew) {
					if (member == lessonnew.teacher) {
						lessonnew.teacherPresent = true;
						member.createDM().then(dm => {
							dm.send(`You have reconnected to ${lessonnew.lesson.toUpperCase()}@${clsidnew.charAt(0).toUpperCase() + clsidnew.slice(1)}`);
						});
					}
					else {
						const student = lessonnew.students.find(map => map.id === member.id);
						if (!student) {
							lessonnew.students.push({
								user: member,
								id: member.id,
								name: member.nickname || member.user.username,
								attendance: {
									joined: [new Date().getTime()],
									left: [],
								},
							});
							console.log(`${member.id} joined the lesson for the first time`);
						}
						else {
							student.attendance.joined.push(new Date().getTime);
							console.log(`${student.name} (${student.id}) joined the lesson again (${student.attendance.joined.length})`);
						}
					}
				}
			}
		}
		else if (newchan) {
			const clsidnew = newchan.name.slice(0, 2);
			const lessonnew = lessons.find(les => les.class === clsidnew);
			if (lessonnew) {
				if (member == lessonnew.teacher) {
					lessonnew.teacherPresent = true;
					member.createDM().then(dm => {
						dm.send(`You have reconnected to ${lessonnew.lesson.toUpperCase()}@${clsidnew.charAt(0).toUpperCase() + clsidnew.slice(1)}`);
					});
				}
				else {
					const student = lessonnew.students.find(map => map.id === member.id);
					if (!student) {
						lessonnew.students.push({
							user: member,
							id: member.id,
							name: member.nickname || member.user.username,
							attendance: {
								joined: [new Date().getTime()],
								left: [],
							},
						});
						console.log(`${member.id} joined the lesson for the first time`);
					}
					else {
						student.attendance.joined.push(new Date().getTime);
						console.log(`${member.id} joined the lesson again (${student.attendance.joined.length})`);
					}
				}
			}
		}
	})
	.on(`guildMemberAdd`, member => {
		client.sendWelcomeMessage(member);
	});

/* client.setProvider(
	sqlite.open(path.join(__dirname, `database.db`)).then(db => new commando.SQLiteProvider(db)),
).catch(console.error); */

client.registry
	.registerDefaultTypes()
	.registerGroups([
		[`lesson`, `Teaching commands`],
		[`fun`, `Fun commands`],
		[`dev`, `Utilites`],
	])
	.registerDefaultGroups()
	.registerDefaultCommands()
	.registerCommandsIn(path.join(__dirname, `commandos`));

client.login(token);