const express = require('express');

const app = express();
const lessonHandler = require('./lessonhandler');
const interactionsHandler = require('./interactionshandler').router;
const authHandler = require('./auth').router;
const authorizer = require('./auth').reqauth;
const go = require('./go');
const path = require('path');
const cookie = require('cookie-parser');

const cors = require('cors');
const RateLimit = require('express-rate-limit');

const authLimiter = new RateLimit({
	windowMs: 1000,
	max: 3,
});

app.use(cookie());
app.use(authorizer.bind(this, false));
app.use(cors({ origin: '*' }));

app.use('/lessons', lessonHandler);

app.use('/auth', authLimiter, authHandler);

app.use('/go', go);

app.use('/interactions', interactionsHandler);

app.get('/bot', (req, res) => {
	res.send(global.client.user);
});

app.use('/download/secure', authorizer.bind(this, true), express.static('download/secure'));

app.use('/download', express.static('download'));

app.get('/owners', (req, res) => {
	res.send(global.client.application.owner);
});

app.get('/howtoid', (req, res) => {
	res.sendFile(path.join(__dirname, 'howtoid.html'));
});

app.all('/*', (req, res) => {
	res.status(404).send(`Not found`);
});

module.exports = app;