const express = require('express');

const app = express();
const lessonHandler = require('./lessonhandler');
const interactionsHandler = require('./interactionshandler').router;
const authHandler = require('./auth').router;
const authorizer = require('./auth').reqauth;

const cors = require('cors');
const RateLimit = require('express-rate-limit');
const { verifyKeyMiddleware } = require('discord-interactions');

const authLimiter = new RateLimit({
	windowMs: 1000,
	max: 3,
});

app.use(authorizer);
app.use(cors({ origin: '*' }));

app.use('/lessons', lessonHandler);

app.use('/auth', authLimiter, authHandler);

app.use('/interactions', verifyKeyMiddleware(process.env.PUBKEY), interactionsHandler);

app.get('/bot', (req, res) => {
	res.send(global.client.user);
});

app.get('/owners', (req, res) => {
	res.send(global.client.owners);
});

app.all('/*', (req, res) => {
	res.status(404).send(`Not found`);
});

module.exports = app;