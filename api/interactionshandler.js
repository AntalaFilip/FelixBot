const { InteractionType, verifyKeyMiddleware, InteractionResponseType } = require('discord-interactions');
const express = require('express');

const router = express.Router();
const manager = global.client.interactionManager;

router.post('/', verifyKeyMiddleware(process.env.PUBKEY), (req, res) => {
	const interaction = req.body;

	const type = interaction.type;
	const token = interaction.token;
	const id = interaction.id;

	// Handle pings
	if (type == InteractionType.PING) {
		res.status(200).send({ type: InteractionResponseType.PONG });
		return;
	}

	// Handle interactions
	return manager.handleIncomingInteraction(interaction, res);
});

exports.router = router;
