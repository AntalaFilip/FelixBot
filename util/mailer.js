const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
	host: process.env.SMTPHOST,
	port: process.env.SMTPPORT,
	secure: process.env.SMTPTLS,
	auth: {
		user: process.env.SMTPUSER,
		pass: process.env.SMTPPASS,
	},
}, {
	from: 'FelixBot <noreply@felixbot.antala.tk>',
	replyTo: 'Filip Antala <filip@felixmuzikal.sk>',
	sender: 'FelixBot <noreply@felixbot.antala.tk>',
});

module.exports = transport;