const express = require('express');

const router = express.Router();
const db = require('../managers/databasemanager').db;

router.get('/', (req, res) => {
	if (!req.authorized) return res.status(401).send();
	if (!req.authorized.isTeacher && !req.authorized.admin) return res.status(403).send();
	const query = req.query;
	const classt = req.authorized.classTeacher;

	let data;
	query.ongoing == 'true' ? data = global.client.databaseManager.getOngoingLessons() : data = global.client.databaseManager.getAllLessons();
	if (!data) return res.status(500).send();
	data.then(lss => {
		lss.forEach(ls => {
			delete ls.allocated;
			delete ls._events,
			delete ls._eventsCount;
			const st = [];
			ls.students.forEach(s => st.push({ name: s.name, partial: true }));
			ls.students = st;
			ls.teacher = { name: ls.teacher.name, partial: true, member: { userID: ls.teacher.member.id } };
		});
		if (query.class) lss = lss.filter(l => l.classid == query.class);
		let lessons;
		if (req.authorized.isTeacher) {
			if (classt) lessons = lss.filter(ls => classt.name.startsWith(ls.classid));
			else lessons = lss.filter(ls => ls.teacher.member.id == req.authorized.member.userID);
		}
		if (req.authorized.admin) lessons = lss;
		if (query.own == `true`) lessons = lss.filter(ls => ls.teacher.member.id == req.authorized.member.userID);
		res.send({
			lessons: lessons,
		});
	});
});

router.get('/:id', (req, res) => {
	global.client.databaseManager.getLesson(undefined, req.params['id'])
		.then(ls => {
			if (!ls) return res.status(404).send();
			if (!req.authorized.isTeacher && !req.authorized.admin) return res.status(403).send();
			res.send({ lesson: ls });
		});
});

router.post('/:id', (req, res) => {
	res.status(500).send();
});

router.patch('/:id', (req, res) => {
	res.status(500).send();
});

router.delete('/:id', (req, res) => {
	if (!req.authorized) return res.status(401).send();
	if (!req.authorized.admin) return res.status(403).send();

	db.query(`DELETE * FROM lessons WHERE id = ${req.params.id}`,
		(err, response) => {
			if (err) return res.status(500).send({ err: err });
			res.status(200).send();
		});
});

module.exports = router;