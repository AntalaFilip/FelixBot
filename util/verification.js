const jwt = require('jsonwebtoken');
const { mailer } = require('./mailer');
const config = require('../config.json');

async function sendEmailVerification(email, name, data) {
	const token = jwt.sign(data, process.env.AUTHSECRET, { expiresIn: '6h' });

	const sent = await mailer.sendMail({
		to: email,
		subject: 'Verify your Discord identity',
		html: `
		<div>
		<h1>FelixBot</h1>
		<p>Hey ${name || 'there'}, someone ${data.requester ? '(' + data.requester + ')' : ''} attempted to identify as you in the FELIX Community Discord.</p>
		<h4>If this was you:</h4>
		<p>Follow this link to verify your identity: https://api.felixbot.antala.tk/auth/verify/email/${token}}</p>
		<h4>If this wasn't you:</h4>
		<p>Please, contact the administrator of the FELIX Discord here: ${config.adminemail}</p>
		</div>
		<p><small>This email was sent automatically on behalf of ${config.sender} &bull; <a href="https://api.felixbot.antala.tk/go/privacy-policy">privacy policy</a></small></p>
		`,
	});

	return sent;
}

async function verifyIdentity(token) {
	const result = jwt.verify(token, process.env.AUTHSECRET);

}

module.exports = { sendEmailVerification, verifyIdentity };