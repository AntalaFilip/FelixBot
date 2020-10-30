const { Collection, MessageEmbed } = require("discord.js");
const commando = require(`discord.js-commando`);
const oneLine = require(`common-tags`).oneLine;
const path = require(`path`);
const { open } = require(`sqlite`);
const sqlite3 = require(`sqlite3`);
const { token } = require(`./config.json`);

const client = new commando.CommandoClient({
	owner: `329957366042984449`,
	commandPrefix: `!`,
});

async function watchStudent() {
	client.guilds.cache.find(gld => gld.id === `702836521622962198`).members.fetch().then(members => {
		const usr = members.random();
		if (usr.id != `702803698463801355` && usr.id != `702801293089177601`) client.user.setActivity(`${usr.nickname || usr.user.username}`, { type: `WATCHING` });
		setTimeout(() => { watchStudent(); }, 10000);
	});
}

client.lessons = new Collection();
client.spamprot = new Collection();

client.sendWelcomeMessage = (member) => {
	member.createDM().then(dm => {
		dm.send(`Ahoj! Vitaj vo FELIX Discorde!`);
		dm.send(`Prosím Ťa, napíš svoje meno, priezvisko a triedu jednému z našich administrátorov (Filip Antala, Mati Halák, Zuzka Burjanová) aby Ťa mohli zaradiť do tvojej triedy.`);
		dm.send(`Ak sa Ti ale nechce písať administrátorovi (alebo žiaden práve nie je online), môžeš napísať meno a triedu aj mne nasledovne (prosím, používaj diakritiku):`);
		dm.send(`iam [Meno] [Priezvisko] [Trieda]`);
	});
	// Debug log
	console.log(`Sent a welcome message to ${member.user.username}`);
};

client.joinedLesson = (member, lessonKey) => {
	// Get current time
	const curtimems = new Date().getTime();
	// Get current lesson
	const lesson = client.lessons.get(lessonKey);
	// If the member is the teacher
	if (member == lesson.teacher) {
		// Set teacher presence
		lesson.teacherPresent = true;
		// Notify teacher
		member.createDM().then(dm => {
			dm.send(`You have reconnected to ${lesson.lesson.toUpperCase()}@${lesson.class.charAt(0).toUpperCase() + lesson.class.slice(1)}`);
		});
		// Debug log
		console.log(`The teacher (${lesson.teacherName}) has rejoined!`);
	}
	// Else if it is a student
	else {
		// Fetch student from lesson
		const student = lesson.students.find(mem => mem.id === member.id);
		// Get current channel
		const chan = member.voice.channel;
		// If the student joined for the first time
		if (!student) {
			// Push new student array
			lesson.students.push({
				user: member,
				id: member.id,
				name: member.nickname || member.user.username,
				chan: chan,
				attendance: {
					joined: [curtimems],
					left: [],
				},
			});
			// Debug log
			console.log(`${member.id} joined the lesson for the first time [${curtimems}]`);
		}
		// Else...
		else {
			// Push new join time to attendance
			student.attendance.joined.push(curtimems);
			// Set current channel
			student.chan = chan;
			// Debug log
			console.log(`${student.name} (${student.id}) joined the lesson again (${student.attendance.joined.length}) [${curtimems}]`);
		}
	}
};

client.leftLesson = (member, lessonKey) => {
	// Get current lesson
	const lesson = client.lessons.get(lessonKey);
	// If the member is the teacher
	if (member == lesson.teacher) {
		// Get class ID
		const clsid = lesson.class;
		// Set teacher presence
		lesson.teacherPresent = false;
		// Warn teacher
		member.createDM().then(dm => {
			dm.send(`You disconnected from an ongoing lesson (${lesson.lesson.toUpperCase()}@${clsid.charAt(0).toUpperCase() + clsid.slice(1)})! Please reconnect or end the lesson (!teach end). The lesson is going to be ended automatically in 5 minutes`);
			// Set the five min timeout
			setTimeout(() => {
				// If the lesson still exists
				if (client.lessons.get(lessonKey)) {
					// And if the teacher is still not present
					if (!lesson.teacherPresent) {
						// Notify teacher
						dm.send(`The lesson (${lesson.lesson.toUpperCase()}@${clsid.charAt(0).toUpperCase() + clsid.slice(1)}) was ended due to you not being present for five minutes!`);
						// End the lesson
						client.endLesson(lessonKey);
					}
				}
			}, 300000);
		});
		console.log(`The teacher (${lesson.teacherName}) has left the lesson!`);
	}
	// Else if it is a student
	else {
		// Get student from the lesson
		const student = lesson.students.find(std => std.id === member.id);
		// Get current time in ms
		const curtimems = new Date().getTime();
		// Push ms time to attendance array
		student.attendance.left.push(curtimems);
		// Debug log
		console.log(`${student.name} has left the lesson! (${curtimems})`);
	}
};

client.endLesson = (lessonKey) => {
	const lesson = client.lessons.get(lessonKey);
	const students = lesson.students;
	const textchan = lesson.textchannel;
	const teacher = lesson.teacher;
	const publicembed = new MessageEmbed()
		.setColor(`#ff0000`)
		.setTitle(`Lesson ended!`)
		.setDescription(`${lesson.lesson.toUpperCase()} has ended!`)
		.setThumbnail(`https://cdn.discordapp.com/attachments/371283762853445643/768906541277380628/Felix-logo-01.png`)
		.setTimestamp()
		.setFooter(`The lesson has ended!`);
	if (teacher.user.avatarURL()) publicembed.setAuthor(`${lesson.teacherName}`, `${teacher.user.avatarURL()}`);
	else (publicembed.setAuthor(`${lesson.teacherName}`));

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
		const name = students[i].name;
		console.log(`##Looping (private) ${i} - ${name}##`);
		const atten = [];
		let joinedms = 0;
		let leftms = new Date().getTime();
		for (let ii = 0; ii < students[i].attendance.joined.length; ii++) {
			joinedms = joinedms + students[i].attendance.joined[ii];
			console.log(`Joined ${ii} - ${joinedms}`);
		}
		for (let ii = 0; ii < students[i].attendance.left.length; ii++) {
			leftms = leftms + students[i].attendance.left[ii];
			console.log(`Left ${ii} - ${leftms}`);
		}
		let netms = 0;
		console.log(`Joined: ${joinedms} Left: ${leftms}`);
		if (joinedms > leftms) netms = joinedms - leftms;
		else netms = leftms - joinedms;
		const min = Math.floor(netms / 60000);
		console.log(`push ${netms} (${min})`);
		const firstjoined = new Date(students[i].attendance.joined[0]);
		atten.push(`First joined at ${firstjoined.getHours()}:${firstjoined.getMinutes()}`);
		atten.push(`Total time: ${min} min`);
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
	.on(`voiceStateUpdate`, async (oldstate, newstate) => {
		const member = newstate.member;
		const currenttime = `${new Date().getHours()}:${new Date().getMinutes()}`;
		const oldchan = oldstate.channel;
		const newchan = newstate.channel;
		const lessons = client.lessons;
		if (newchan != oldchan) {
			if (oldchan) {
				if (newchan) {
					console.log(`${currenttime} - ${member.nickname || member.user.username} changed channels from ${oldchan.name} to ${newchan.name}`);
				}
				else {
					console.log(`${currenttime} - ${member.nickname || member.user.username} left ${oldchan.name}`);
				}
			}
			else if (newchan) {
				console.log(`${currenttime} - ${member.nickname || member.user.username} joined ${newchan.name}`);
			}
		}
		// Does the old channel exist?
		if (oldchan) {
			const clsid = oldchan.name.slice(0, 2);
			const lesson = lessons.find(les => les.class === clsid);
			const lessonKey = lessons.findKey(les => les.class === clsid);
			// Is there an ongoing lesson in the old channel?
			if (lesson) {
				// Does the old channel not match the new channel
				if (oldchan !== newchan) {
					// If the channel is not in the same category
					if (newchan == null || newchan.name.slice(0, 2) !== clsid) {
						client.leftLesson(member, lessonKey);
					}
				}
			}
			// Does the new channel exist?
			if (newchan) {
				// Get the class ID
				const clsidnew = newchan.name.slice(0, 2);
				// Find the lesson and key
				const lessonnew = lessons.find(les => les.class === clsidnew);
				const lessonnewKey = lessons.findKey(les => les.class == clsidnew);
				// Is there an ongoing lesson in the new channel, are the lessons not the same, are the channels not the same
				if (lessonnew && lessonnewKey != lessonKey && newchan != oldchan) {
					client.joinedLesson(member, lessonnewKey);
				}
			}
		}
		else if (newchan) {
			// Get the class ID
			const clsidnew = newchan.name.slice(0, 2);
			// Find the lesson and key
			const lessonnew = lessons.find(les => les.class === clsidnew);
			const lessonnewKey = lessons.findKey(les => les.class === clsidnew);
			// Is there an ongoing lesson in the new channel
			if (lessonnew) {
				client.joinedLesson(member, lessonnewKey);
			}
		}
	})
	.on(`guildMemberAdd`, member => {
		client.sendWelcomeMessage(member);
	})
	.on(`message`, async message => {
		/* if (!message.guild) return;
		const member = message.member;
		const chan = message.channel;
		if (!member.hasPermission(`MANAGE_MESSAGES`, { checkAdmin: true, checkOwner: true }) && !chan.name.contains(`fun`)) {
			// Check caps
		} */
	});

client.setProvider(
	open({
		filename: `./database.db`,
		driver: sqlite3.Database,
	}).then(db => new commando.SQLiteProvider(db)),
).catch(console.error);

client.registry
	.registerDefaultTypes()
	.registerGroups([
		[`lesson`, `Teaching commands`],
		[`fun`, `Fun commands`],
		[`dev`, `Utilites`],
		[`audio`, `Audio commands`],
	])
	.registerDefaultGroups()
	.registerDefaultCommands()
	.registerCommandsIn(path.join(__dirname, `commandos`));

client.login(token);