const express = require('express');
const { InteractionResponseFlags, verifyKeyMiddleware } = require('discord-interactions');
const { InteractionType, CallbackType, MessageComponent, ButtonStyle } = require('../util/interactions');


const router = express.Router();
const manager = global.client.interactionManager;

router.post('/', verifyKeyMiddleware(process.env.PUBKEY), (req, res) => {
	const interaction = req.body;

	const type = interaction.type;
	const token = interaction.token;
	const id = interaction.id;

	// Handle pings
	if (type == InteractionType.PING) {
		res.status(200).send({ type: CallbackType.PONG });
		return;
	}

	// Handle interactions
	return manager.handleIncomingInteraction(interaction, res);

	if (type == InteractionType.COMMAND) {
		const data = interaction.data;
		const member = interaction.member;
		const user = interaction.user || member.user;

		global.apilogger.debug(`Received an interaction "${data.name}" from ${user.username}`);

		const response = {
			"type": CallbackType.CHANNEL_MESSAGE,
			"data": {
				"tts": false,
				"content": "Test!",
				"components": [
					MessageComponent.actionRow(
						MessageComponent.button(ButtonStyle.Primary, { label: 'Test!' }, 'test_click'),
					),
				],
			},
		};

		if (data.name == "test" && data.options && data.options[0].value == true) {
			response.data.flags = InteractionResponseFlags.EPHEMERAL;
		}

		res.status(200).send(response);
	}

	if (type == InteractionType.COMPONENT) {
		const response = {
			"type": 7,
			"data": {
				"content": 'Yeh clicked meh!',
			},
		};
		res.status(200).send(response);
	}

});

exports.router = router;
