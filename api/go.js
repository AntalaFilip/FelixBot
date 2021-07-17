const express = require('express');
const router = express.Router();

const redirects = require('./redirects.json');

router.get('/:id', (req, res) => {
	const id = req.params['id'];

	const redirect = redirects.find(r => r.from === id);

	if (!redirect) return res.status(404).send();

	res.redirect(redirect.to);
});

module.exports = router;