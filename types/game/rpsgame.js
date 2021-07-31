const { GuildMember, User, TextChannel, DMChannel, Collection } = require("discord.js");
const EventEmitter = require("events");
const FelixBotClient = require("../../client");
const crypto = require('crypto');
const { Game, GamePlayer } = require("./game");

/**
 * @typedef {'ROCK' | 'PAPER' | 'SCISSORS'} RPSChoice
 */

const RPSDefs = {
	scoring: {
		'ROCK': {
			'PAPER': -1,
			'ROCK': 0,
			'SCISSORS': 1,
		},
		'PAPER': {
			'SCISSORS': -1,
			'PAPER': 0,
			'ROCK': 1,
		},
		'SCISSORS': {
			'ROCK': -1,
			'SCISSORS': 0,
			'PAPER': 1,
		},
	},
	/**
	 * @param {RPSChoice} one
	 * @param {RPSChoice} two
	 * @returns {number}
	 */
	beats: (one, two) => {
		try {
			return RPSDefs.scoring[one][two];
		}
		catch(err) {
			return;
		}
	},
};

class RPSGame extends Game {
	/**
	 *
	 * @param {'BO1' | 'BO3' | 'ENDLESS'} type
	 * @param {GuildMember | User} player
	 * @param {boolean} longer
	 */
	constructor(type, player, longer) {
		super(player);
		this.type = type;

		/** @type {RPSRound[]} */
		this.rounds = [];
		this.roundOngoing = false;

		this.players.set(
			player.id, new GamePlayer(player),
		);

		this.longer = longer ?? false;


		this.awaitingOpponent = new Date();
		this.awaitingOpponentTimeout = setTimeout(() => {
			this.end(this.client.user, 'Opponent timed out');
		}, 30e3);
	}

	/** @return {FelixBotClient} */
	get client() {
		return global.client;
	}

	get manager() {
		return this.client.gameManager;
	}

	get full() {
		return this.players.size >= 2;
	}

	get remainingRounds() {
		let num = Infinity;
		if (this.type === 'BO1') num = 1;
		else if (this.type === 'BO3') num = 3;
		return num - this.rounds.length;
	}

	get p1() {
		return this.players.first();
	}
	get p2() {
		return this.players.first(2).pop();
	}

	start() {
		if (this.started) throw new Error('Game has already started');
		if (this.ended) throw new Error('Game has ended already');

		if (this.players.length < 2) throw new Error('Not enough players');
		if (!this.players.every(p => p.ready)) throw new Error("Everyone's not ready!");

		this.started = new Date();
		this.emit('started');
		this.manager.logger.verbose(`RPS: starting new game (${this.id})`);
		this.newRound();
	}

	newRound() {
		if (!this.started) throw new Error('Game has not started yet!');
		if (this.ended) throw new Error('Game has already ended');
		if (this.roundOngoing) throw new Error('Round is currently ongoing!');
		if (this.nextRoundTimeout) {
			clearTimeout(this.nextRoundTimeout);
			this.nextRoundTimeout = null;
		}

		const round = new RPSRound(this.rounds.length + 1);
		this.roundOngoing = this.rounds.push(round);
		this.emit('roundStart', round, this.remainingRounds);
		this.manager.logger.verbose(`RPS: ${this.id}: started new round ${round.id}`);
		this.endRoundTimeout = setTimeout(() => this.endRound(), this.longer ? 10e3 : 7e3);
	}

	/**
	 * @param {GamePlayer} player
	 * @param {RPSChoice} choice
	 */
	selectChoice(player, choice) {
		if (!this.roundOngoing) throw new Error('There is no round ongoing!');

		const round = this.rounds[this.rounds.length - 1];
		round.choices.set(player.id, choice);
		this.emit('playerSelectedChoice', player, choice);

		if (round.choices.size === this.players.size) {
			if (this.endRoundTimeout) clearTimeout(this.endRoundTimeout);
			this.endRoundTimeout = setTimeout(() => this.endRound(), this.longer ? 5e3 : 3e3);
		}
	}

	/**
	 *
	 * @param {RPSChoice[]} param0
	 */
	endRound() {
		if (!this.roundOngoing) throw new Error('No round ongoing');
		if (this.endRoundTimeout) {
			clearTimeout(this.endRoundTimeout);
			this.endRoundTimeout = null;
		}
		const round = this.rounds[this.rounds.length - 1];

		const p1c = round.choices.get(this.p1.id);
		const p2c = round.choices.get(this.p2.id);

		const points = RPSDefs.beats(p1c, p2c);
		const winner =
			(points === 0 || typeof points != 'number')
				? null
				: (points > 0
					? (this.p1.score += points, this.p1)
					: (this.p2.score += (points * -1), this.p2)
				);

		round.end(winner);

		this.roundOngoing = false;

		this.emit('roundEnd', round, this.remainingRounds);
		if (this.remainingRounds > 0) {
			this.nextRoundTimeout = setTimeout(() => this.newRound(), this.longer ? 10e3 : 5e3);
		}
		else {
			this.end(this.client.user, 'Rounds played!');
		}
	}

	/**
	 * @param {GuildMember | User} user
	 * @param {string} reason
	 */
	end(user, reason) {
		if (this.ended) throw new Error('Game has already ended');
		this.emit('ending', user, reason);
		if (this.roundOngoing) this.endRound([null, null]);
		if (this.nextRoundTimeout) {
			clearTimeout(this.nextRoundTimeout);
			this.nextRoundTimeout = null;
		}
		if (this.awaitingOpponentTimeout) {
			clearTimeout(this.awaitingOpponentTimeout);
			this.awaitingOpponentTimeout = null;
			this.awaitingOpponent = null;
		}
		this.ended = new Date();

		const stats = this.calculateStats();
		this.stats = stats;

		this.emit('ended', stats);
	}

	calculateStats() {
		if (!this.started) return null;
		const p2s = new Collection();
		this.players.forEach(p => {
			p2s.set(p.id, {
				points: p.score,
				wins: this.rounds.filter(r => r.winner && r.winner.id === p.id).length,
				losses: this.rounds.filter(r => r.winner && r.winner.id != p.id).length,
				choices: this.rounds.map(r => r.choices.get(p.id)),
			});
		});

		return {
			stats: p2s,
			winning: Array.from(this.players.values()).sort((a, b) => b.score - a.score)[0],
		};
	}

	/**
	 * @param {GuildMember | User} player
	 * @returns
	 */
	playerJoin(player) {
		if (this.players.length >= 2) throw new Error('Maximum players reached');
		if (this.awaitingOpponentTimeout) {
			clearTimeout(this.awaitingOpponentTimeout);
		}
		const time = this.awaitingOpponent.getTime();
		const waited = Math.round((Date.now() - time) / 1e3);
		this.awaitingOpponentTimeout = null;
		this.awaitingOpponent = false;
		const p = new GamePlayer(player);

		this.players.set(player.id, p);
		this.emit('playerJoin', p, waited);
		return p;
	}

	/**
	 * @param {GuildMember | User | GamePlayer} player
	 * @param {boolean} ready
	 */
	playerReady(player, ready) {
		const rpsp = this.players.find(p => p.id === player.id);
		if (!rpsp) throw new Error('This player is not in the game!');

		rpsp.setReady(ready);

		if (this.players.every(p => p.ready)) {
			this.emit('allPlayersReady');
			if (!this.started) {
				setTimeout(() => this.start(), this.longer ? 6e3 : 3e3);
			}
		}

		this.emit('playerReadyChange', rpsp, ready);
	}

	/**
	 * @param {GuildMember | User | GamePlayer} player
	 */
	playerLeave(player) {
		const p = this.players.get(player.id);
		if (!p) throw new Error('This player is not in the game!');
		if (this.started && !this.ended) {
			this.end(player, 'Player has left!');
		}
		else if (!this.started) {
			this.players.delete(player.id);
			this.emit('playerLeave', player);
			if (this.players.size === 0) {
				this.end(this.client.user, 'No players left!');
			}
			else {
				this.awaitingOpponent = new Date();
				this.awaitingOpponentTimeout = setTimeout(() => this.end(this.client.user, 'Opponent timed out'), 30e3);
			}
		}
	}
}

class RPSRound {
	constructor(num) {
		this.id = num;
		/** @type {GamePlayer} */
		this.winner = null;
		/** @type {Collection<import("discord.js").Snowflake, RPSChoice} */
		this.choices = new Collection();
		this.ended = false;
	}

	/**
	 *
	 * @param {GamePlayer} winner
	 */
	end(winner) {
		this.ended = true;
		this.winner = winner;
	}
}

module.exports = { RPSGame, RPSRound, RPSDefs };