const { Client } = require("discord.js");
const http = require('http');
const DatabaseManager = require("./managers/databasemanager");
const VoiceManager = require("./managers/voicemanager");
const PermissionsManager = require("./managers/permmanager");
const LessonManager = require("./managers/lessonmanager");
const AuditManager = require("./managers/auditmanager");
const InteractionManager = require("./managers/interactionmanager");
const Logger = require("./util/logger");
const config = require('./config.json');
const EduPageManager = require("./managers/edupagemanager");

class FelixBotClient extends Client {
	/**
	 *
	 * @param {import("discord.js").ClientOptions} opts
	 */
	constructor(opts) {
		super(opts);
		global.client = this;
		this.logger = new Logger("CLIENT");

		this.once('ready', async () => {
			this.databaseManager = new DatabaseManager(this);
			this.voiceManager = new VoiceManager(this);
			this.permManager = new PermissionsManager(this);
			this.lessonManager = new LessonManager(this);
			await this.lessonManager.ready;
			this.auditManager = new AuditManager(this);
			await this.auditManager.ready;
			this.interactionManager = new InteractionManager(this);
			this.edupageManager = new EduPageManager(this);
			await this.edupageManager.ready;
			this.emit('loaded');
			this.server = http.createServer(require('./api/express')).listen(process.env.PORT, () => this.logger.log(`HTTP Server ready on ${process.env.PORT}!`));
			this.user.setActivity(config.presenceStatus);
		});
	}

	isDev() {
		return process.env.NODE_ENV === 'DEVELOPMENT';
	}

	isProd() {
		return process.env.NODE_ENV === 'PRODUCTION';
	}

	isTest() {
		return process.env.NODE_ENV === 'TESTING';
	}
}

module.exports = FelixBotClient;