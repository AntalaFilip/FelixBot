const express = require('express');
const { InteractionType, InteractionResponseType, InteractionResponseFlags } = require('discord-interactions');

const router = express.Router();

router.post('/', (req, res) => {
	const data = req.body;
	const token = data.token;

	// Handle pings
	if (req.body.type = InteractionType.PING) {
		res.status(200).send({ type: InteractionResponseType.PONG });
	}


});

exports.router = router;
