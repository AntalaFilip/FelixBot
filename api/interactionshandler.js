const express = require('express');
const { InteractionType, InteractionResponseType, InteractionResponseFlags, verifyKeyMiddleware } = require('discord-interactions');

const router = express.Router();

router.post('/', verifyKeyMiddleware(process.env.PUBKEY), (req, res) => {
	const body = req.body;

	const type = body.type;
	const token = body.token;
	const id = body.id;

	// Handle pings
	if (type == InteractionType.PING) {
		res.status(200).send({ type: InteractionResponseType.PONG });
		return;
	}


	// Handle interactions
	if (type == InteractionType.APPLICATION_COMMAND) {
		const data = body.data;
		const member = body.member;
		const user = body.user || member.user;

		global.apilogger.debug(`Received an interaction "${data.name}" from ${user.username}`);

		const response = {
			"type": InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
			"data": {
				"tts": false,
				"content": "Test!",
			},
		};

		if (data.name == "test" && data.options[0] == true) {
			response.data.flags = InteractionResponseFlags.EPHEMERAL;
		}

		res.status(200).send(response);
	}

});

exports.router = router;
