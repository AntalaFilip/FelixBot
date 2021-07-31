const { CommandInteraction, MessageComponentInteraction, MessageButton, MessageEmbed, User, GuildMember, MessageActionRow, Message, Interaction, Collection } = require("discord.js");
const { Command } = require("../../types/command");
const { GamePlayer } = require("../../types/game/game");
const { RPSGame, RPSRound } = require("../../types/game/rpsgame");

class RPSCommand extends Command {
	constructor(client) {
		super(client, {
			id: `870605749947084850`,
			name: `rockpaperscissors`,
			group: `games`,
			memberName: `rps`,
			description: `Play a game of rock-paper-scissors!`,
			components: ['rps_join', 'rps_leave', 'rps_ready', 'rps_select_rock', 'rps_select_scissors', 'rps_select_paper', 'rps_end'],
		});

		this.components = {
			joinGame: (gameid) => (
				new MessageButton({
					style: 'PRIMARY',
					label: 'Join the game',
					emoji: '🎮',
					customId: `rps_join/${gameid}`,
				})
			),
			leaveGame: (gameid) => (
				new MessageButton({
					style: 'DANGER',
					label: 'Leave the game',
					emoji: '🚪',
					customId: `rps_leave/${gameid}`,
				})
			),
			picks: {
				rock: (gameid) => (
					new MessageButton({
						style: 'PRIMARY',
						label: 'ROCK',
						emoji: '\ud83e\udea8',
						customId: `rps_select_rock/${gameid}`,
					})
				),
				paper: (gameid) => (
					new MessageButton({
						style: 'PRIMARY',
						label: 'PAPER',
						emoji: '📰',
						customId: `rps_select_paper/${gameid}`,
					})
				),
				scissors: (gameid) => (
					new MessageButton({
						style: 'PRIMARY',
						label: 'SCISSORS',
						emoji: '✂️',
						customId: `rps_select_scissors/${gameid}`,
					})
				),
			},
			ready: (gameid, ready) => (
				new MessageButton({
					style: ready ? 'DANGER' : 'SUCCESS',
					label: ready ? 'Not ready' : 'Ready!',
					emoji: ready ? '❌' : '✅',
					customId: `rps_ready/${gameid}`,
				})
			),
			endGame: (gameid) => (
				new MessageButton({
					style: 'DANGER',
					label: 'END GAME',
					emoji: '🏁',
					customId: `rps_end/${gameid}`,
				})
			),
		};

		this.listeners = [
			{ name: 'started', func: this.onGameStart },
			{ name: 'roundStart', func: this.onRoundStart },
			{ name: 'roundEnd', func: this.onRoundEnd },
			{ name: 'ending', func: this.onEnding },
			{ name: 'ended', func: this.onEnd },
			{ name: 'playerJoin', func: this.onPlayerJoin },
			{ name: 'playerLeave', func: this.onPlayerLeave },
			{ name: 'playerReadyChange', func: this.onPlayerReadyChange },
			{ name: 'allPlayersReady', func: this.onAllPlayersReady },
		];

		this.embeds = {
			lookingForOpponents: (interaction, game, member) => (
				new MessageEmbed()
					.setAuthor(game.players.get(member.id).name, member.user.avatarURL())
					.setTitle('Looking for opponents...')
					.setDescription(`
@here ${member.displayName} wants to play a game of rock-paper-scissors!
Join by clicking the button!`)
					.setFooter(`Play a game of rock-paper-scissors by using /${interaction.commandName}`)
					.setTimestamp()
					.addFields(game.players.map(p => ({ name: p.name, value: `Ready: ${p.ready}` })))
			),
			gameStartedEmbed: (game) => (
				new MessageEmbed()
					.setColor('ORANGE')
					.setTitle(`Rock Paper Scissors (${game.type})`)
					.setDescription('Game has started\nPlease wait until the first round begins')
					.setFooter(`The round will begin in 3-5 seconds`)
					.addFields(game.players.map(p => ({ name: p.name, value: `Score: ${p.score}` })))
			),
			roundStartedEmbed: (game, round, remaining) => (
				new MessageEmbed()
					.setColor('PURPLE')
					.setTitle(`Rock Paper Scissors (${game.type}) - round ${round.id}`)
					.setDescription('Pick now!')
					.setFooter(`Round ends in about 10 seconds\n${remaining} rounds remaining`)
					.addFields(game.players.map(p => ({ name: p.name, value: round.choices.get(p.id) ? 'Chosen!' : 'Choosing...' })))
			),
			roundEndedEmbed: (game, round) => (
				new MessageEmbed()
					.setColor('DARK_NAVY')
					.setTitle(`Rock Paper Scissors (${game.type}) - round ${round.id}`)
					.setDescription(`Round has ended!\nWinner: ${round.winner ? round.winner.name : 'No winner'}`)
					.setFooter(game.remainingRounds > 0 ? 'Next round starts in about 6 seconds...' : 'This was the last round')
					.addFields(game.players.map(p => ({ name: p.name, value: round.choices.get(p.id) ?? 'No choice' })))
			),
			gameEndingEmbed: (game, user, reason) => (
				new MessageEmbed()
					.setColor('RED')
					.setTitle(`Rock Paper Scissors (${game.type})`)
					.setDescription('Game ending...')
					.setFooter(`${user.displayName || user.username} ended the game: ${reason}`)
			),
			gameEndedEmbed: (game, stats) => (
				new MessageEmbed()
					.setColor('DARK_RED')
					.setTitle(`Rock Paper Scissors (${game.type})`)
					.setFooter('The game has ended!')
					.setDescription(`The game has ended after ${game.rounds.length} rounds\nWinner: ${stats.winning ? stats.winning.name : 'No winner'}\nStatistics:`)
					.addFields(stats.stats.map((stat, pid) => ({
						name: game.players.get(pid).name,
						value: `Score: ${stat.points}\nWins: ${stat.wins}\nLosses: ${stat.losses}`,
						inline: true,
					})))
			),
			playerJoinEmbed: (game) => (
				new MessageEmbed()
					.setTitle(`Rock Paper Scissors (${game.type})`)
					.setColor('LUMINOUS_VIVID_PINK')
					.setDescription(game.full ? `All players have joined, waiting until they are ready.` : `Waiting for players...`)
					.addFields(game.players.array().map(p => ({ name: p.name, value: `Ready: ${p.ready}` })))
					.setTimestamp()
			),
			playerLeaveEmbed: (game, player) => (
				new MessageEmbed()
					.setTitle(`Rock Paper Scissors (${game.type})`)
					.setColor('LUMINOUS_VIVID_PINK')
					.setDescription(`${player.name} has left the game\nWaiting for players...`)
					.addFields(game.players.array().map(p => ({ name: p.name, value: `Ready: ${p.ready}` })))
					.setTimestamp()
			),
			playerReadyChangeEmbed: (game, player) => (
				new MessageEmbed()
					.setTitle(`Rock Paper Scissors (${game.type})`)
					.setColor('FUCHSIA')
					.setDescription(`${player.name} is ${!player.ready ? 'not ' : ''}ready!${game.full ? "\nWaiting until everyone's ready..." : '\nWaiting for players...'}`)
					.addFields(game.players.array().map(p => ({ name: p.name, value: `Ready: ${p.ready}` })))
					.setTimestamp()
			),
			allPlayersReadyEmbed: (game) => (
				new MessageEmbed()
					.setTitle(`Rock Paper Scissors (${game.type})`)
					.setColor('DARK_GREEN')
					.setDescription(`All players ready, starting game...`)
					.addFields(game.players.array().map(p => ({ name: p.member.displayName, value: `Ready: ${p.ready}` })))
					.setTimestamp()
			),
		};
	}

	/**
	 *
	 * @param {CommandInteraction} interaction
	 */
	async run(interaction) {
		const guild = interaction.guild;
		const args = interaction.options;
		const gametype = args.getString('type');
		const GMGR = this.client.gameManager;

		if (guild) {
			// TODO: add check to only use in FUN channels
			const member = interaction.member;
			const opponent = args.getMember('opponent', false);
			if (!opponent) {
				const game = GMGR.create('RPS', gametype, member);
				const embed = this.embeds.lookingForOpponents(interaction, game, member);

				/** @type {Message} */
				const msg = await interaction.channel.send({
					embeds: [embed],
					components: [
						new MessageActionRow()
							.addComponents(
								this.components.joinGame(game.id),
							),
					],
				});
				await interaction.reply({ content: 'Waiting for opponent...', ephemeral: true });

				game.on('playerJoin', async player => {
					const emb = this.embeds.lookingForOpponents(interaction, game, member);
					if (game.full) {
						await msg.edit({ embeds: [emb], components: [new MessageActionRow().addComponents(msg.components[0].components[0].setDisabled(true))] });
					}
					else await msg.edit({ embeds: [emb] });
				});
				game.on('onPlayerLeave', async player => {
					const emb = this.embeds.lookingForOpponents(interaction, game, member);
					await msg.edit({ embeds: [emb], components: [new MessageActionRow().addComponents(msg.components[0].components[0].setDisabled(true))] });
				});
				game.once('started', async () => {
					await msg.delete();
				});
				this.exec(interaction, game);
			}
		}
	}
	/**
	 * @param {CommandInteraction} interaction
	 * @param {RPSGame} game
	 */
	exec(interaction, game) {
		const wrapped = this.wrapper(
			interaction, game,
			...this.listeners.map(l => l.func),
		);

		wrapped.forEach((func, i) => {
			game.on(this.listeners[i].name, func);
		});
	}

	/**
	 *
	 * @param {Interaction} interaction
	 * @param {RPSGame} game
	 */
	unexec(interaction, game) {
		const wrapped = this.wrapper(
			interaction, game,
			this.listeners.map(l => l.func),
		);

		wrapped.forEach((func, i) => {
			if (!func.arguments.find(a => a === interaction)) return;
			game.off(this.listeners[i].name, func);
		});
	}

	/**
	 *
	 * @param {MessageComponentInteraction} interaction
	 */
	async component(interaction) {
		const split = interaction.customId.split('/');
		const id = split[0];
		const args = split.slice(1);

		if (id === 'rps_join') {
			/** @type {RPSGame} */
			const game = this.client.gameManager.games.get(args[0]);
			if (!game) return await interaction.followUp({ ephemeral: true, content: 'This game does not exist!' });
			if (game.players.has(interaction.user.id)) return await interaction.followUp({ ephemeral: true, content: 'You have already joined the game!' });
			try {
				await interaction.reply({
					ephemeral: true,
					content: 'Joining game...',
				});
				this.exec(interaction, game);
				game.playerJoin(interaction.member || interaction.user);
			}
			catch (err) {
				return await interaction.followUp({ ephemeral: true, content: err.message });
			}
		}
		else if (id === 'rps_leave') {
			const member = interaction.member || interaction.user;
			/** @type {RPSGame} */
			const game = this.client.gameManager.games.get(args[0]);
			if (!game) return await interaction.followUp({ ephemeral: true, content: 'This game does not exist' });
			const player = game.players.get(member.id);
			if (!player) return await interaction.followUp({ ephemeral: true, content: 'You are not in the game!' });
			this.unexec(interaction, game);
			game.playerLeave(player);
			await interaction.update({ content: 'You have left the game!', components: [], embeds: [] });
		}
		else if (id === 'rps_ready') {
			const member = interaction.member || interaction.user;
			/** @type {RPSGame} */
			const game = this.client.gameManager.games.get(args[0]);
			const player = game.players.get(member.id);
			game.playerReady(player, !player.ready);
			await interaction.update({
				embeds: [this.embeds.playerReadyChangeEmbed(game, player)],
				components: [
					new MessageActionRow()
						.addComponents(
							this.components.ready(game.id, player.ready),
						),
				],
			});
		}
		else if (id.includes('rps_select')) {
			/** @type {RPSGame} */
			const game = this.client.gameManager.games.get(args[0]);
			if (!game) return await interaction.reply({ ephemeral: true, content: 'This game does not exist' });
			const member = interaction.member || interaction.user;
			const player = game.players.get(member.id);
			if (!player) return await interaction.reply({ ephemeral: true, content: 'You are not in the game!' });

			const selection = id.split('_').pop().toUpperCase();
			game.selectChoice(player, selection);
			/** @type {MessageEmbed} */
			const embed = this.embeds.roundStartedEmbed(game, game.rounds[game.rounds.length - 1], game.remainingRounds);
			embed.setDescription(`You picked ${selection}`);
			await interaction.update({
				embeds: [embed],
				components: [
					new MessageActionRow()
						.addComponents(
							this.components.picks[selection.toLowerCase()](game.id)
								.setDisabled(true)
								.setStyle('SUCCESS'),
						),
				],
			});
		}
		else if (id === 'rps_end') {
			/** @type {RPSGame} */
			const game = this.client.gameManager.games.get(args[0]);
			if (!game) return await interaction.reply({ ephemeral: true, content: 'This game does not exist' });
			const member = interaction.member || interaction.user;
			const player = game.players.get(member.id);
			if (!player) return await interaction.reply({ ephemeral: true, content: 'You are not in the game!' });

			await interaction.deferUpdate();
			game.end(interaction.member || interaction.user, 'end game button');
		}
	}

	/**
	 * @param {MessageComponentInteraction} i
	 * @param {RPSGame} g
	 */
	async onGameStart(i, g) {
		const embed = this.embeds.gameStartedEmbed(g);

		await i.editReply({
			embeds: [embed],
		});
	}
	/**
	 * @param {MessageComponentInteraction} i
	 * @param {RPSGame} g
	 * @param {RPSRound} round
	 * @param {number} remaining
	 */
	async onRoundStart(i, g, round, remaining) {
		const embed = this.embeds.roundStartedEmbed(g, round, remaining);

		await i.editReply({
			embeds: [embed],
			components: [
				new MessageActionRow()
					.addComponents(
						this.components.picks.rock(g.id),
						this.components.picks.paper(g.id),
						this.components.picks.scissors(g.id),
					),
				new MessageActionRow()
					.addComponents(
						this.components.endGame(g.id),
					),
			],
		});
	}
	/**
	 * @param {MessageComponentInteraction} i
	 * @param {RPSGame} g
	 * @param {RPSRound} round
	 * @param {number} remaining
	 */
	async onRoundEnd(i, g, round, remaining) {
		/** @type {MessageEmbed} */
		const embed = this.embeds.roundEndedEmbed(g, round);

		await i.editReply({
			embeds: [embed],
			components: [
				new MessageActionRow()
					.addComponents(
						this.components.endGame(g.id),
					),
			],
		});
	}
	/**
	 * @param {MessageComponentInteraction} i
	 * @param {RPSGame} g
	 * @param {GuildMember | User} user
	 * @param {string} reason
	 */
	async onEnding(i, g, user, reason) {
		const embed = this.embeds.gameEndingEmbed(g, user, reason);

		await i.editReply({ embeds: [embed], components: [] });
	}
	/**
	 * @param {MessageComponentInteraction} i
	 * @param {RPSGame} g
	 * @param {Object} stats
	 * @param {Collection<import("discord.js").Snowflake, Object>} [stats.stats]
	 * @param {GamePlayer} [stats.winning]
	 */
	async onEnd(i, g, stats) {
		/** @type {MessageEmbed} */
		const embed = this.embeds.gameEndedEmbed(g, stats);

		// TODO add rematch functionality
		await i.editReply({ embeds: [embed], components: [], content: 'Thanks for playing!' });
	}
	/**
	 * @param {MessageComponentInteraction} i
	 * @param {RPSGame} g
	 * @param {GamePlayer} player
	 * @param {number} time
	 */
	async onPlayerJoin(i, g, player, time) {
		const embed = this.embeds.playerJoinEmbed(g);

		await i.editReply({
			embeds: [embed],
			components: [
				new MessageActionRow()
					.addComponents(
						this.components.ready(g.id, player.ready),
						this.components.leaveGame(g.id),
					),
			],
		});
	}
	/**
	 * @param {MessageComponentInteraction} i
	 * @param {RPSGame} g
	 * @param {GamePlayer} player
	 */
	async onPlayerLeave(i, g, player) {
		const embed = this.embeds.playerLeaveEmbed(g, player);

		await i.editReply({
			embeds: [embed],
		});
	}
	/**
	 * @param {MessageComponentInteraction} i
	 * @param {RPSGame} g
	 * @param {GamePlayer} player
	 * @param {boolean} ready
	 */
	async onPlayerReadyChange(i, g, player, ready) {
		/** @type {MessageEmbed} */
		const embed = this.embeds.playerReadyChangeEmbed(g, player);

		await i.editReply({
			embeds: [embed],
		});
	}

	/**
	 * @param {MessageComponentInteraction} i
	 * @param {RPSGame} g
	 * @param {GamePlayer} player
	 * @param {import("../../types/game/rpsgame").RPSChoice} choice
	 */
	async onPlayerPickChoice(i, g, player, choice) {
		if (player.id === i.user.id) return;

		/** @type {MessageEmbed} */
		const embed = this.embeds.roundStartedEmbed(g, g.rounds[g.rounds.length - 1], g.remainingRounds);
		await i.editReply({ embeds: [embed] });
	}

	/**
	 * @param {MessageComponentInteraction} i
	 * @param {RPSGame} g
	 */
	async onAllPlayersReady(i, g) {
		/** @type {MessageEmbed} */
		const embed = this.embeds.allPlayersReadyEmbed(g);

		await i.editReply({ embeds: [embed] });
	}


	/**
	 * @param {Function[]} functions
	 */
	wrapper(i, g, ...functions) {
		const bound = functions.map(f => (
			f.bind(this, i, g)
		), this);
		return bound;
	}
}

module.exports = RPSCommand;