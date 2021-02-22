const express = require('express');
const axios = require('axios').default;

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
				if (err === false) res.status(401).send({ message: `You are not a member of the Felix Discord server!`, join: `https://discord.gg/kKh8BeS` });
				else if (err.status) res.status(err.status).send();
				else res.status(500).send();
			},
		);
});

function authorize(token) {
	return new Promise((resolve, reject) => {
		axios.get('https://discord.com/api/users/@me', { headers: { 'Authorization': token } })
			.then(response => {
				if (response.status != 200) return reject({ status: response.status });
				const member = global.client.guilds.cache.find(g => g.id == `702836521622962198`).members.resolve(response.data.id);
				if (!member) return resolve(false);
				global.client.permManager.isClassTeacher(member)
					.then(classteacher => {
						resolve({
							user: member.user,
							member: member,
							admin: member.hasPermission(`ADMINISTRATOR`),
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

function reqauth(req, res, next) {
	const token = req.header(`Authorization`);
	req.authorized = false;
	if (!token) return next();
	authorize(token)
		.then(result => {
			req.authorized = result;
			return next();
		})
		.catch(err => next());
}

exports.router = router;
exports.authorize = authorize;
exports.reqauth = reqauth;