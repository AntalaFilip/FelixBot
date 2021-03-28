const { Guild, Collection, VoiceChannel, User } = require("discord.js");
const Logger = require("../util/logger");
const fs = require('fs');
const { CommandoClient } = require("discord.js-commando");
const TimeUtils = require("../util/timeutils");
const { dateToString } = require("../util/stringutils");

class AudioManager {
	/**
	 *
	 * @param {CommandoClient} client
	 */
	constructor(client) {
		this.client = client;
		this.logger = new Logger(`AudioManager`);
		this.playing = new Collection();
		this.recording = new Collection();
	}

	/**
	 * @param {Guild} guild
	 * @returns {boolean}
	 */
	isReady(guild) {
		if (this.playing.findKey(key => key == guild.id)) return false;
		if (this.recording.findKey(key => key == guild.id)) return false;

		return true;
	}

	/**
	 *
	 * @param {VoiceChannel} channel
	 * @param {User?} user
	 */
	async startRecording(channel, user) {
		const conn = await channel.join();
		this.logger.debug(`Creating a new audio stream for ${user.username + "#" + user.discriminator}`);
		const audio = conn.receiver.createStream(user, { mode: "pcm", end: "silence" });
		audio.on("end", () => {
			this.logger.debug("Finished recording!");
			conn.disconnect();
		});
		const path = `audio/record/${new Date().toISOString().replace(":", "")}`;
		this.logger.debug(`Creating a new write stream to ${path}`);
		audio.pipe(fs.createWriteStream(path)).on("close", () => this.logger.debug("Write stream closed!"));
	}

}

module.exports = AudioManager;