const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
	if (!req.authorized) return res.status(401).send();
	if (!req.authorized.isTeacher && !req.authorized.admin) return res.status(403).send();
	const query = req.query;
	const classt = req.authorized.classTeacher;

	if (query.ongoing == `true`) {
		global.client.databaseManager.getOngoingLessons()
			.then(lss => {
				if (query.class) lss.filter(l => l.classid == query.class);
				let lessons;
				if (req.authorized.isTeacher) {
					if (classt) lessons = lss.filter(ls => classt.name.includes(ls.classid));
					else lessons = lss.filter(ls => ls.teacher.member.id == req.authorized.member.userID);
				}
				if (req.authorized.admin) lessons = lss;
				if (query.own == `true`) lessons = lss.filter(ls => ls.teacher.member.id == req.authorized.member.userID);
				res.send({
					lessons: lessons,
				});
			});
	}
	else {
		global.client.databaseManager.getAllLessons()
			.then(lss => {
				if (query.class) lss.filter(l => l.classid == query.class);
				let lessons;
				if (req.authorized.isTeacher) {
					if (classt) lessons = lss.filter(ls => classt.name.includes(ls.classid));
					else lessons = lss.filter(ls => ls.teacher.member.id == req.authorized.member.userID);
				}
				if (req.authorized.admin) lessons = lss;
				if (query.own == `true`) lessons = lss.filter(ls => ls.teacher.member.id == req.authorized.member.id);
				res.send({
					lessons: lessons,
				});
			});
	}
});

router.post('/:id', (req, res) => {
	res.status(500).send();
});

router.patch('/:id', (req, res) => {
	res.status(500).send();
});

module.exports = router;