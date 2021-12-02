const jwt = require('jsonwebtoken');
const { mailer } = require('./mailer');
const config = require('../config.json');
const FelixBotClient = require('../client');
const EduTeacher = require('../types/edu/eduteacher');
const { GuildMember } = require('discord.js');

/**
 *
 * @param {string} email
 * @param {string?} name
 * @param {Object} data
 * @param {import('discord.js').Snowflake} [data.userid]
 * @param {import('discord.js').Snowflake} [data.roleid]
 * @returns
 */
async function sendEmailVerification(email, name, data) {
	data.to = {
		email,
		name,
	};
	const token = jwt.sign(data, process.env.AUTHSECRET, { expiresIn: '6h' });

	const sent = await mailer.sendMail({
		to: email,
		subject: 'Verify your Discord identity',
		html: `
		<div>
		<h1>FelixBot</h1>
		<p>Hey ${name || 'there'}, someone ${data.requester ? '(' + data.requester + ')' : ''} attempted to identify as you in the FELIX Community Discord.</p>
		<h4>If this was you:</h4>
		<p>Follow this link to verify your identity: ${process.env.URL}/auth/verify/email/${token}</p>
		<h4>If this wasn't you:</h4>
		<p>Please, contact the administrator of the FELIX Discord here: ${config.admin.email}</p>
		</div>
		<p><small>This email was sent automatically on behalf of ${config.admin.name} &bull; <a href="https://api.felixbot.antala.tk/go/privacy-policy">Privacy policy</a></small></p>
		`,
	});

	return sent;
}

async function verifyIdentity(token) {
	/** @type {FelixBotClient} */
	const client = global.client;
	const DB = client.databaseManager;

	const result = jwt.verify(token, process.env.AUTHSECRET);
	const id = result.userid;
	const user = await DB.getTeacher(id) || await DB.getMember(id);
	if (!user) throw new Error('Invalid payload!');
	if (user.verification === 'VERIFIED') throw new Error('Already verified!');
	/** @type {GuildMember} */
	const member = user.member;
	const role = member.guild.roles.resolve(result.roleid);
	const eusr = user.eduUser;

	if (eusr instanceof EduTeacher) {
		const roles = eusr.subjects.map(s => s.role);
		roles.unshift(config.teacherrole);
		if (eusr.class) roles.push(eusr.class.role);
		if (role && !roles.includes(role)) roles.push(role);
		member.roles.add(roles, 'Automatic identification process; verified email');
		await DB.updateTeacher(id, { verification: 'VERIFIED' });
	}
	else {
		const roles = [user.role];
		if (role && !roles.includes(role)) roles.push(role);
		member.roles.add(roles, 'Automatic identificaton process; verified email');
		await DB.updateMember(id, { verification: 'VERIFIED' });
	}

	await member.send(`Úspešne si si verifikoval identitu.`);
	return user;
}

module.exports = { sendEmailVerification, verifyIdentity };