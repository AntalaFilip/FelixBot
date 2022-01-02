const { VoiceChannel, Intents } = require('discord.js');

const SendWelcomeCommand = require('./commands/misc/sendwelcome');
const Logger = require('./util/logger');
const Lesson = require('./types/lesson/lesson');
const FelixBotClient = require('./client');
const EduStudent = require('./types/edu/edustudent');
const EduTeacher = require('./types/edu/eduteacher');
const config = require('./config.json');
require('dotenv').config();

const intents = new Intents().add('DIRECT_MESSAGES', 'DIRECT_MESSAGE_REACTIONS', 'DIRECT_MESSAGE_TYPING', 'GUILDS', 'GUILD_BANS', 'GUILD_INTEGRATIONS', 'GUILD_INVITES', 'GUILD_MEMBERS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'GUILD_MESSAGE_TYPING', 'GUILD_PRESENCES', 'GUILD_VOICE_STATES', 'GUILD_WEBHOOKS');
const client = new FelixBotClient({ intents: intents });

global.apilogger = new Logger("API");
const logger = client.logger;

client
	.on(`error`, e => logger.error(e))
	.on(`warn`, m => logger.warn(m))
	.on(`debug`, m => logger.debug(m))
	.on(`disconnect`, () => { logger.warn(`Disconnected!`); })
	.on(`reconnecting`, () => { logger.warn(`Reconnecting...`); })
	.once(`ready`, () => {
		logger.info(`Ready; logged in as ${client.user.username}#${client.user.discriminator} (${client.user.id})`);
	})
	.once(`loaded`, () => {
		logger.info('FelixBot loaded!');
		client
			.on(`voiceStateUpdate`, (oldstate, newstate) => client.voiceManager.voiceStateUpdate(oldstate, newstate))
			.on(`channelCreate`, channel => {
				logger.verbose(`A ${channel.type} channel (${channel.id}) was created!`);
				if (channel instanceof VoiceChannel) {
					// BUG: big big problems
					const lesson = client.lessonManager.lessons.find(ls => ls.classid == channel.parent.name.slice(0, 2));
					if (Lesson.is(lesson) && !client.lessonManager.isAllocated(channel) && !channel.name.includes('*')) {
						client.lessonManager.allocate(channel, lesson);
					}
				}
			})
			.on(`messageCreate`, async (message) => {
				if (message.content.startsWith('!') && !message.author.bot) {
					const reply = await message.reply(`! commands are no longer supported. Please use slash (/) commands instead`);
					await message.delete();
					setTimeout(async () => reply.delete(), 10e3);
				}
			})
			.on(`guildMemberAdd`, async member => {
				client.logger.info(`${member.displayName} (${member.id}) has joined the server, awaiting screening pass...`);
			})
			.on('guildMemberUpdate', async (oldm, newm) => {
				if (oldm.pending === true && newm.pending === false) {
					client.logger.info(`${newm.displayName} (${newm.id}) passed membership screening.`);
					const DB = client.databaseManager;
					const dbm = await DB.getMember(newm.id) || await DB.getTeacher(newm.id);
					// When a new member joins, execute the SendWelcomeCommand
					if (!dbm) {
						new SendWelcomeCommand(client).exec(newm);
					}
					else {
						const eusr = dbm.eduUser;
						const role = dbm.role;
						const name = dbm.name;
						const roles = [];
						client.logger.verbose(`Setting properties fetched from database for ${newm.id}`);
						if (eusr instanceof EduStudent) roles.push(eusr.class.role);
						else if (eusr instanceof EduTeacher) roles.push(eusr.subjects.map(s => s.role), config.roles.teacher);

						if (role && !roles.includes(role)) roles.push(role);
						await newm.roles.add(roles, `Automatic identification process; database`);
						client.logger.verbose(`Added roles: ${roles.map(r => r.id || r)}`);
						if (name) await newm.setNickname(name, `Automatic identification process; database`);
						client.logger.verbose(`Set name: ${name}`);
						await newm.send(`
		Ahoj, vitaj znovu vo Felix Discorde!
		Keďže už si raz bol/a členom, automaticky som ti nastavil údaje.
		Ak je niečo nesprávne, napíš prosím naším administrátorom.`);
						client.logger.verbose(`Sent message, props set!`);
						client.logger.debug(`Automatically set user properties for ${newm.id}`);
					}
				}
				if (oldm.displayName != newm.displayName) {
					const user = client.databaseManager.getMember(null, newm.id);
					if (user) {
						client.databaseManager.updateMember(newm.id, { name: newm.displayName });
					}
				}
			})
			.on(`interactionCreate`, async interaction => {
				await client.interactionManager.handleIncomingInteraction(interaction);
			});
	});

client.login(process.env.TOKEN);

process.on('SIGINT', () => {
	client.logger.log('Shutting down...');
	if (client.server) {
		client.server.close(() => {
			process.exit(0);
		});
	}
	else process.exit(0);
});