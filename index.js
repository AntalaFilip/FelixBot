const { VoiceChannel, Intents } = require('discord.js');

const SendWelcomeCommand = require('./commands/misc/sendwelcome');
const Logger = require('./util/logger');
const Lesson = require('./types/lesson/lesson');
const FelixBotClient = require('./client');
require('dotenv').config();

const intents = new Intents().add('DIRECT_MESSAGES', 'DIRECT_MESSAGE_REACTIONS', 'DIRECT_MESSAGE_TYPING', 'GUILDS', 'GUILD_BANS', 'GUILD_INTEGRATIONS', 'GUILD_INVITES', 'GUILD_MEMBERS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'GUILD_MESSAGE_TYPING', 'GUILD_PRESENCES', 'GUILD_VOICE_STATES', 'GUILD_WEBHOOKS');
const client = new FelixBotClient({ intents: intents });

global.apilogger = new Logger("API");
const logger = client.logger;

client
	.on(`error`, logger.error)
	.on(`warn`, logger.warn)
	.on(`debug`, logger.debug)
	.once(`ready`, () => {
		logger.log(`Ready; logged in as ${client.user.username}#${client.user.discriminator} (${client.user.id})`);
	})
	.on(`disconnect`, () => { logger.warn(`Disconnected!`); })
	.on(`reconnecting`, () => { logger.warn(`Reconnecting...`); })
	.on(`voiceStateUpdate`, (oldstate, newstate) => client.voiceManager.voiceStateUpdate(oldstate, newstate))
	.on(`channelCreate`, channel => {
		logger.debug(`A ${channel.type} channel (${channel.id}) was created!`);
		if (channel instanceof VoiceChannel) {
			const lesson = client.lessonManager.lessons.find(ls => ls.classid == channel.parent.name.slice(0, 2));
			if (Lesson.is(lesson) && !client.lessonManager.isAllocated(channel) && !channel.name.includes('*')) {
				client.lessonManager.allocate(channel, lesson);
			}
		}
	})
	.on(`guildMemberAdd`, member => {
		// When a new member joins, execute the SendWelcomeCommand
		new SendWelcomeCommand(client).exec(member);
	})
	.on(`interactionCreate`, async interaction => {
		await client.interactionManager.handleIncomingInteraction(interaction);
	});

client.login(process.env.TOKEN);

process.on('SIGINT', () => {
	client.logger.log('Shutting down...');
	client.server.close(() => {
		process.exit(1);
	});
});