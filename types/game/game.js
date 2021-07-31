const crypto = require('crypto');
const { GuildMember, User, Collection } = require('discord.js');
const EventEmitter = require('events');

class Game extends EventEmitter {
	/**
	 * @param {GuildMember | User} creator
	 */
	constructor(creator) {
		super();
		this.creator = creator;
		this.id = creator.id.slice(-2) + crypto.randomBytes(4).toString('hex');

		this.started = false;
		this.ended = false;

		/** @type {Collection<import("discord.js").Snowflake, GamePlayer} */
		this.players = new Collection();
	}
}

class GamePlayer extends EventEmitter {
	/**
	 *
	 * @param {GuildMember | User} member
	 */
	constructor(member) {
		super();
		this.member = member;
		this.ready = false;
		this.score = 0;
	}

	/**
	 * @param {boolean} ready
	 */
	setReady(ready) {
		this.ready = ready;
		this.emit('readyChange', ready);
	}

	/**
	 * @param {number} num
	 */
	setScore(num) {
		this.score = num;
		this.emit('scoreChange', this.score);
	}

	/**
	 * @param {number} num
	 */
	incremScore(num) {
		this.score += num;
		this.emit('scoreChange', this.score);
	}

	/**
	 * @param {number} num
	 */
	decremScore(num) {
		this.score -= num;
		this.emit('scoreChange', this.score);
	}

	get id() {
		return this.member.id;
	}

	/**
	 * @returns {string}
	 */
	get name() {
		return this.member.displayName || this.member.username + '#' + this.member.discriminator;
	}
}

module.exports = { Game, GamePlayer };