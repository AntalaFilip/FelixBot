const { Collection, MessageEmbed } = require(`discord.js`);
const commando = require(`discord.js-commando`);
const oneLine = require(`common-tags`).oneLine;
const path = require(`path`);
const { open } = require(`sqlite`);
const sqlite3 = require(`sqlite3`);
const { token } = require(`./config.json`);
const timetable = require(`./timetable`);

const client = new commando.CommandoClient({
	owner: `329957366042984449`,
	commandPrefix: `!`,
});

let day = new Date().getDay();
client.period = null;
client.holidays = [`2/10`, `6/10`];
client.week = `b`;
client.lessons = new Collection();
client.spamprot = new Collection();

const tick = async () => {
	day = new Date().getDay();
	updatePeriod();
	watchStudent();
	setTimeout(() => { tick(); }, 10000);
};

const watchStudent = () => {
	client.guilds.cache.find(gld => gld.id === `702836521622962198`).members.fetch().then(members => {
		const usr = members.random();
		if (usr.id != `702803698463801355` && usr.id != `702801293089177601`) client.user.setActivity(`${usr.nickname || usr.user.username}`, { type: `WATCHING` });
	});
};

const updatePeriod = () => {
	const hrs = new Date().getUTCHours();
	switch (hrs) {
	case 7:
		client.period = 0;
		break;
	case 8:
		client.period = 1;
		break;
	case 9:
		client.period = 2;
		break;
	case 10:
		client.period = 3;
		break;
	case 11:
		client.period = 4;
		break;
	case 12:
		client.period = 5;
		break;
	default:
		client.period = null;
		break;
	}
};

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
		// Check if teacher was not present to prevent DMs being sent on lesson start
		if (!lesson.teacherPresent) {
			// Notify teacher
			member.createDM().then(dm => {
				dm.send(`You have reconnected to ${lesson.lesson.toUpperCase()}@${lesson.class.charAt(0).toUpperCase() + lesson.class.slice(1)}`);
			});
		}
		// Set teacher presence
		lesson.teacherPresent = true;
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

client.startLesson = async (teacher, lessonId, vchan, tchan) => {
	const ctg = vchan.parent;
	const date = new Date();
	const lesson = lessonId.substring(lessonId.indexOf(`!`) + 1, lessonId.indexOf(`@`));
	// Add the lesson to the array
	client.lessons.set(lessonId, {
		textchannel: tchan,
		class: lessonId.substring(lessonId.indexOf(`@`) + 1, lessonId.indexOf(`#`)),
		lesson: lesson,
		teacher: teacher,
		teacherName: teacher.displayName,
		teacherPresent: true,
		students: [],
		startedAt: {
			date: `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`,
			time: `${date.getHours()}:${date.getMinutes()}`,
			mstime: date.getTime(),
		},
		period: client.period,
	});
	const crntlsn = client.lessons.get(lessonId);
	// Run joinedlesson for each student already in the category
	const ctgf = ctg.children.filter(chan => chan.type === `voice`);
	for (const chan of ctgf) {
		for (const mem of chan[1].members) {
			if (mem[1] === teacher) continue;
			client.joinedLesson(mem[1], lessonId);
		}
	}
	// Create an embed and send it to the original text channel
	const embed = new MessageEmbed()
		.setColor(`#00ff00`)
		.setTitle(`Lesson started!`)
		.setAuthor(`${teacher.displayName}`, teacher.user.avatarURL())
		.setDescription(`${lesson.toUpperCase()} has started, happy learning!`)
		.setThumbnail('https://cdn.discordapp.com/attachments/371283762853445643/768906541277380628/Felix-logo-01.png')
		.setTimestamp()
		.setFooter(`End the lesson by running !teach end`);
	crntlsn.embedmsg = await tchan.send(embed);
};

client.endLesson = (lessonKey) => {
	// Get current lesson
	const lesson = client.lessons.get(lessonKey);
	// Get the students array, text channel where the lesson was started and the teacher
	const students = lesson.students;
	const textchan = lesson.textchannel;
	const teacher = lesson.teacher;
	// Create the red public embed symbolizing lesson end and send it to the text channel
	const publicembed = new MessageEmbed()
		.setColor(`#ff0000`)
		.setTitle(`Lesson ended!`)
		.setAuthor(`${lesson.teacherName}`, teacher.user.avatarURL())
		.setDescription(`${lesson.lesson.toUpperCase()} has ended!`)
		.setThumbnail(`https://cdn.discordapp.com/attachments/371283762853445643/768906541277380628/Felix-logo-01.png`)
		.setTimestamp()
		.setFooter(`The lesson has ended!`);
	textchan.send(publicembed);
	// Create the yellow private embed, summarizing the lesson
	const privateembed = new MessageEmbed()
		.setColor(`#ffff00`)
		.setTitle(`Summary of ${lesson.lesson.toUpperCase()}@${lesson.class.charAt(0).toUpperCase() + lesson.class.slice(1)}`)
		.setAuthor(`${client.user.username}`, `${client.user.avatarURL()}`)
		.setDescription(`The summary of ${lesson.lesson.toUpperCase()}@${lesson.class.charAt(0).toUpperCase() + lesson.class.slice(1)} lasting from ${lesson.startedAt.time} to ${new Date().getHours()}:${new Date().getMinutes()}`)
		.setThumbnail(`https://cdn.discordapp.com/attachments/371283762853445643/768906541277380628/Felix-logo-01.png`)
		.setTimestamp();
	const extraembed = new MessageEmbed()
		.setColor(`#ffff00`);
	// Populate the private embed - loop until all the student data has been processed
	for (let i = 0; i < students.length; i++) {
		// Get the current student's name
		const name = students[i].name;
		// Create a var with join times
		let joinedms = 0;
		// Create a var with leave times
		let leftms = 0;
		const jlen = students[i].attendance.joined.length;
		const llen = students[i].attendance.left.length;
		if (jlen > llen) leftms = leftms + new Date().getTime();
		// Loop all the join (ms) times and add them to joinedms
		for (let ii = 0; ii < students[i].attendance.joined.length; ii++) {
			joinedms = joinedms + students[i].attendance.joined[ii];
		}
		// Loop all the leave (ms) times and add them to leftms
		for (let ii = 0; ii < students[i].attendance.left.length; ii++) {
			leftms = leftms + students[i].attendance.left[ii];
		}
		// Create a var with the net time in lesson (ms)
		let netms = 0;
		if (joinedms > leftms) netms = joinedms - leftms;
		else netms = leftms - joinedms;
		// Convert the net time to minutes and floor them
		const min = Math.floor(netms / 60000);
		// Get the first joined time
		const firstjoined = new Date(students[i].attendance.joined[0]);
		// Create an array with the current student's processed attendance data
		const atten = [`First joined at ${firstjoined.getHours()}:${firstjoined.getMinutes()}`, `Total time: ${min} min`];
		// Add the data to the embed, if the embed's limit is hit, use the extra embed
		if (i <= 25) { privateembed.addField(name, atten, true); }
		else if (i < 50) { extraembed.addField(name, atten, true); }
		else { teacher.createDM().then(dm => dm.send(`Unfortunately, I have reached the user limit I can log for you`)); break; }
	}
	// Send the populated private embed to the teacher
	teacher.createDM().then(dm => {
		dm.send(privateembed);
		if (extraembed.fields.length != 0) dm.send(extraembed);
	});
	// Delete the lesson from the map
	client.lessons.delete(lessonKey);
};

client
	.on(`error`, console.error)
	.on(`warn`, console.warn)
	.on(`debug`, console.log)
	.on(`ready`, () => {
		console.log(`Ready; logged in as ${client.user.username}#${client.user.discriminator} (${client.user.id})`);
		tick();
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
		const date = new Date();
		const member = newstate.member;
		const currenttime = `${date.getHours()}:${date.getMinutes()}`;
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
			else {
				// Get the timetable for today
				const today = timetable[day];
				// Find a lesson in today's timetable, matching the teacher, the class he's just joined, the current period and week
				const upcoming = today.find(les => les.includes(`@${clsidnew}#${member.id}`) && les.includes(`%${client.period}`) && les.includes(`^${client.week}`));
				// Run the startLesson function
				if (upcoming) client.startLesson(member, upcoming, newchan, newchan.parent.children.find(txt => txt.name.includes(upcoming.substring(upcoming.indexOf(`!`) + 1, upcoming.indexOf(`@`))) && txt.type === `text`));
			}
		}
	})
	.on(`guildMemberAdd`, member => {
		client.sendWelcomeMessage(member);
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
		[`dev`, `Developer commands`],
		[`audio`, `Audio commands`],
	])
	.registerDefaultGroups()
	.registerDefaultCommands({ eval: false, prefix: false })
	.registerCommandsIn(path.join(__dirname, `commands`));

client.login(token);