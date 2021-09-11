const express = require('express');
const axios = require('axios').default;
const { GuildMember } = require('discord.js');
const { verifyIdentity } = require('../util/verification');
const { JsonWebTokenError, TokenExpiredError } = require('jsonwebtoken');

const router = express.Router();

router.get('/', (req, res) => {
	const token = req.header(`Authorization`);
	res.setHeader(`WWW-Authenticate`, `Bearer realm="Discord API", "UTF-8"`);
	if (!token) return res.status(401).send();
	authorize(token)
		.then(
			result => {
				res.send(result);
			},
			err => {
				if (err === false) res.status(403).send({ message: `You are not a member of the Felix Discord server!`, join: `https://discord.gg/kKh8BeS` });
				else if (err.status) res.status(err.status).send();
				else res.status(500).send();
			},
		);
});

router.get('/token', (req, res) => {
	const redir = req.query['redirect'];
	const b64 = redir && Buffer.from(encodeURI(redir)).toString('base64');
	res.redirect(`https://discord.com/api/oauth2/authorize?client_id=702922217155067924&redirect_uri=${process.env.REDIR_URI}&response_type=code&scope=identify%20guilds%20email&prompt=none${b64 ? '&state=' + b64 : ''}`);
});

router.get('/callback', async (req, res) => {
	const { code, state } = req.query;
	const uri = state && Buffer.from(state, 'base64').toString('ascii');
	const params = new URLSearchParams();
	params.append('client_id', process.env.APP_ID);
	params.append('client_secret', process.env.CLIENT_SECRET);
	params.append('grant_type', 'authorization_code');
	params.append('code', code);
	params.append('redirect_uri', encodeURI(process.env.REDIR_URI));

	try {
		const r = await axios.post(`https://discord.com/api/oauth2/token`, params);
		res.cookie('authToken', r.data.access_token, { domain: '.felixbot.antala.tk', maxAge: r.data.expires_in });
		if (uri) return res.redirect(uri);
		else return res.send('Success!');
	}
	catch {
		if (uri) return res.redirect(uri);
		else return res.send('Error');
	}
});

router.get('/verify/email/:token', async (req, res) => {
	const token = req.params['token'];
	if (!token) return res.status(400).send('Missing token!');

	try {
		const user = await verifyIdentity(token);
		return res.status(200).send(`Successfully verified`);
	}
	catch (err) {
		if (err instanceof JsonWebTokenError) {
			res.status(404).send('Invalid token');
		}
		else if (err instanceof TokenExpiredError) {
			res.status(403).send('Your verification token has expired!');
		}
		else if (err.message === 'Already verified!') {
			res.status(410).send('You have already verified your identity');
		}
		else if (err.message === 'Invalid payload!') {
			res.status(500).send('Invalid payload!');
		}
		else {
			res.status(500).send('An internal error has occurred');
			global.apilogger.error(err);
		}
	}
});

function authorize(token) {
	return new Promise((resolve, reject) => {
		axios.get('https://discord.com/api/users/@me', { headers: { 'Authorization': `Bearer ${token}` } })
			.then(response => {
				if (response.status != 200) return reject({ status: response.status });
				/**
				 * @type {GuildMember}
				 */
				const member = global.client.guilds.cache.find(g => g.id == `702836521622962198`).members.resolve(response.data.id);
				if (!member) return resolve(false);
				global.client.permManager.isClassTeacher(member)
					.then(classteacher => {
						resolve({
							user: member.user,
							member: member,
							admin: member.permissions.has('ADMINISTRATOR') || member.roles.highest.id === `769952519832600607`,
							isTeacher: global.client.permManager.isTeacher(member),
							subjects: global.client.permManager.getTeacherSubjects(member),
							classTeacher: classteacher,
						});
					})
					.catch(err => {
						global.apilogger.error(err);
						reject(err);
					});
			})
			.catch(err => {
				global.apilogger.error(err);
				reject(err);
			});
	});
}

/**
 *
 * @param {*} reject
 * @param {import('express').Request} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
function reqauth(reject, req, res, next) {
	const token = req.header(`Authorization`) || req.cookies.authToken;
	req.authorized = false;
	if (!token) {
		if (reject) return res.status(403).send(`<p>Forbidden, <a href='/auth/token?redirect=${req.originalUrl}'>login here</a></p>`);
		return next();
	}
	authorize(token)
		.then(result => {
			if (!result && reject) return res.status(401).send(`Unauthorized`);
			req.authorized = result;
			return next();
		})
		.catch(err => {
			if ((err.status || err.response) && reject) return res.status(403).send(`<p>Forbidden, <a href='/auth/token?redirect=${req.originalUrl}'>login here</a></p>`);
			next();
		});
}

exports.router = router;
exports.authorize = authorize;
exports.reqauth = reqauth;