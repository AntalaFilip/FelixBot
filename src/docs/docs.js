import { makeStyles, Typography } from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles(theme => ({
	root: {
		textAlign: 'center',
	},
	header: {
		marginTop: theme.spacing(1),
	}
}));

const texts = [
	'endless void',
	'such empty',
	'there is nothing here',
	'look, white!',
]

function Docs() {
	const classes = useStyles();

	return (
		<div className={classes.root}>
			<Typography variant="h2" className={classes.header}>Dokumentácia</Typography>
			<Typography>{texts[Math.floor(Math.random() * texts.length)]}</Typography>
		</div>
	)
}

export default Docs;