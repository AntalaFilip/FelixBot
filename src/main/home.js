import { makeStyles, Typography, Button } from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles(theme => ({
	root: {
		textAlign: 'center'
	}
}))

function Home() {
	const classes = useStyles();
	return(
		<div className={classes.root}>
			<Typography variant="h3">Vitajte na webe Felixáckeho Discordu!</Typography>
			<Typography variant="h4">Nájdete tu všetky dôležité informácie k online vyučovaniu.</Typography>
			<Button variant="contained" href="/discord">Ako sa pripojiť na Discord</Button>
		</div>
	)
}

export default Home;