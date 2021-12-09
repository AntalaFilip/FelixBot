const { GuildChannel } = require("discord.js");

const StringUtils = {
	/**
	 * @param {string} classid
	 */
	resolveClass(classid) {
		return new Promise((resolve, reject) => {
			global.client.databaseManager.getSettings()
				.then(sett => {
					const resolved = sett.classes.find(val => val.startsWith(classid.toLowerCase()));
					if (resolved) resolve(resolved);
					else reject('This class does not exist!');
				});
		});
	},

	/**
	 * Gets the channel idname
	 * @param {GuildChannel} channel
	 */
	getChanName(channel) {
		if (global.client.lessonManager.isAllocated(channel)) return channel.name.slice(1, 3);
		else return channel.name.slice(0, 2);
	},

	/**
	 * Converts the Date into a YYYY-MM-DD hh-mm-ss value
	 * @param {Date} date The date to convert to String
	 */
	dateToString(date) {
		if (!date) return null;
		return date.toISOString().replace(/T/, ' ').replace(/\..+/, '');
	},

	/**
	 * Capitalizes the first letter of each word of the string and makes everything else lowercase
	 * @param {string} string
	 */
	capitalizeFirstLetter(string) {
		string = string.trim();
		const strings = string.split(' ');
		const uppers = strings.map(s => s.charAt(0).toLocaleUpperCase() + s.slice(1).toLocaleLowerCase());
		return uppers.join(' ');
	},

	/**
	 * Returns the same string without a starting dot.
	 * @param {string} string
	 * @returns {string}
	 */
	removeStartingDot(string) {
		const removed = string.startsWith('.') ? string.slice(1) : string;
		return removed;
	},
};

module.exports = StringUtils;