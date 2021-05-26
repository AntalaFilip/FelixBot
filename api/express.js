const express = require('express');

const app = express();
const lessonHandler = require('./lessonhandler');
const authHandler = require('./auth').router;
const authorizer = require('./auth').reqauth;
const cors = require('cors');
const RateLimit = require('express-rate-limit');
const path = require('path');

const authLimiter = new RateLimit({
	windowMs: 1000,
	max: 3,
});

app.use(authorizer);
app.use(cors({ origin: '*' }));

app.use('/lessons', lessonHandler);

app.use('/auth', authLimiter, authHandler);

app.get('/bot', (req, res) => {
	res.send(global.client.user);
});

app.get('/owners', (req, res) => {
	res.send(global.client.owners);
});

app.use('/download', express.static(path.join(__dirname, '../', 'download')));

app.all('/*', (req, res) => {
	res.status(404).send(`Not found`);
});

module.exports = app;