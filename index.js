const { CommandoClient, FriendlyError, SQLiteProvider } = require('discord.js-commando');
const oneLine = require(`common-tags`).oneLine;
const { join } = require('path');
const { open } = require('sqlite');
const { Database } = require('sqlite3');

const LessonManager = require('./managers/lessonmanager');
const VoiceStateManager = require('./managers/voicestatemanager');
const PermissionsManager = require('./managers/permmanager');
const DatabaseManager = require('./managers/databasemanager');
const TimeUtils = require('./util/timeutils');
const StringUtils = require('./util/stringutils');
const SendWelcomeCommand = require('./commands/dev/sendwelcome');
const Logger = require('./util/logger');
const ExpressApp = require('./api/express');
const http = require('http');
require('dotenv').config();

const client = new CommandoClient({
	owner: `329957366042984449`,
	commandPrefix: process.env.PREFIX,
});

const logger = new Logger("CLIENT");
client.timeUtils = new TimeUtils(client);
client.stringUtils = new StringUtils(client);
global.apilogger = new Logger("API");

client
	.on(`error`, logger.error)
	.on(`warn`, logger.warn)
	.on(`debug`, logger.debug)
	.once(`ready`, () => {
		logger.log(`Ready; logged in as ${client.user.username}#${client.user.discriminator} (${client.user.id})`);
		client.databaseManager = new DatabaseManager(client);
		client.voicestateManager = new VoiceStateManager(client);
		client.permManager = new PermissionsManager(client);
		client.lessonManager = new LessonManager(client);
		http.createServer(ExpressApp).listen(process.env.PORT, () => logger.log(`HTTP Server ready!`));
		client.user.setActivity(`Testing ongoing!`);
	})
	.on(`disconnect`, () => { logger.warn(`Disconnected!`); })
	.on(`reconnecting`, () => { logger.warn(`Reconnecting...`); })
	.on(`commandError`, (cmd, err) => {
		if(err instanceof FriendlyError) return;
		logger.error(`Error in ${cmd.groupID}:${cmd.memberName} ` + err);
	})
	.on('commandBlocked', (msg, reason) => {
		logger.log(oneLine`
			Command ${msg.command ? `${msg.command.groupID}:${msg.command.memberName}` : ''}
			blocked; ${reason}
		`);
	})
	.on('commandPrefixChange', (guild, prefix) => {
		logger.log(oneLine`
			Prefix ${prefix === '' ? 'removed' : `changed to ${prefix || 'the default'}`}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`);
	})
	.on('commandStatusChange', (guild, command, enabled) => {
		logger.log(oneLine`
			Command ${command.groupID}:${command.memberName}
			${enabled ? 'enabled' : 'disabled'}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`);
	})
	.on('groupStatusChange', (guild, group, enabled) => {
		logger.log(oneLine`
			Group ${group.id}
			${enabled ? 'enabled' : 'disabled'}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`);
	})
	.on(`voiceStateUpdate`, (oldstate, newstate) => client.voicestateManager.voiceStateUpdate(oldstate, newstate))
	.on(`channelCreate`, channel => {
		
	})
	.on(`guildMemberAdd`, member => {
		const command = new SendWelcomeCommand(client);
		command.exec(member);
	});

client.setProvider(
	open({
		filename: `./database.db`,
		driver: Database,
	}).then(db => new SQLiteProvider(db)),
).catch(logger.error);

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
	.registerCommandsIn(join(__dirname, `commands`));

global.client = client;
client.login(process.env.TOKEN);