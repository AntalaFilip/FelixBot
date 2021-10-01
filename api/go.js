const express = require('express');
const router = express.Router();

const redirects = require('./redirects.json');

router.get('/:id', (req, res) => {
	const id = req.params['id'];

	const redirect = redirects.find(r => r.from === id);

	if (!redirect) return res.status(404).send();

	let link = redirect.to;
	if (req.query) {
		link += '?' + Object.entries(req.query).map(a => `${a[0]}=${a[1]}`).join('&');
	}

	res.redirect(link);
});

module.exports = router;