const { Collection, User, GuildMember } = require("discord.js");
const FelixBotClient = require("../client");
const { Game } = require("../types/game/game");
const { RPSGame } = require("../types/game/rpsgame");
const Logger = require("../util/logger");

class GameManager {
	/**
	 * @param {FelixBotClient} client
	 */
	constructor(client) {
		this.client = client;
		this.logger = new Logger('GameManager');

		/** @type {Collection<string, Game>} */
		this.games = new Collection();

		this.availableGames = {
			"RPS": RPSGame,
		};
	}

	/**
	 *
	 * @param {string} type
	 */
	create(type, ...params) {
		const GameType = this.availableGames[type];
		if (!GameType) throw new Error('This game is not available!');

		/** @type {Game} */
		const game = new GameType(...params);
		const fin = this.finish.bind(game);
		game.on('ended', fin);
		this.games.set(game.id, game);
		return game;
	}

	/**
	 * @param {Game} game
	 */
	finish(game) {

	}
}

module.exports = GameManager;