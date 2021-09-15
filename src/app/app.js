import { Card, CardActions, CardContent, CircularProgress, Typography, Button, Grid, makeStyles, Backdrop } from '@material-ui/core';
import React, { useContext } from 'react';
import {
	Route,
	BrowserRouter as Router,
	Switch,
} from 'react-router-dom';

import { Context } from '../context';
import Authorize from '../main/authorize';
import Lessons from './lessons';

const useStyles = makeStyles(theme => ({
	root: {
		flexGrow: 1,
		marginLeft: theme.spacing(10),
		marginRight: theme.spacing(10)
	},
	headerText: {
		marginTop: theme.spacing(1),
		textAlign: 'center',
	},
	backdrop: {
		zIndex: theme.zIndex.drawer,
		color: '#fff'
	}
}))

function App() {
	const { rootState: state } = useContext(Context);
	return (
		<Router basename="/app">
			<Switch>
				<Route exact path="/">
					<AppPage state={state} />
				</Route>
				<Route path="/lessons">
					<Authorize perms={"teacher"}>
						<Lessons />
					</Authorize>
				</Route>
			</Switch>
		</Router>
	)
}

function LessonCard() {
	return (
		<Card>
			<CardContent>
				<Typography variant="h5">
					Prehľad hodín
				</Typography>
			</CardContent>
			<CardActions>
				<Button href="/app/lessons">Prehľad hodín</Button>
			</CardActions>
		</Card>
	)
}

function EventMgrCard() {
	return (
		<Card>
			<CardContent>
				<Typography variant="h5">
					Event Management
				</Typography>
			</CardContent>
			<CardActions>
				<Button href="/app/events">Event Management</Button>
			</CardActions>
		</Card>
	)
}

function AppPage() {
	const { rootState: state } = useContext(Context);
	const classes = useStyles();
	return (
		<div className={classes.root}>
			{
				<Grid container spacing={6}>
					<Grid item xs={12} className={classes.headerText}>
						<Typography variant="h3">
							Vitajte vo FelixBot aplikácii, {state.authdata.member.cleanName}.
						</Typography>
						<Typography variant="h5">
							Vyberte si funkciu
						</Typography>
					</Grid>
					<Grid item xs={6}>
						<LessonCard />
					</Grid>
					<Grid item xs={6}>
						<EventMgrCard />
					</Grid>
				</Grid>}
			{/* {props.state.authdata.admin &&
				<Container>
					<Row>
						<Col style={{textAlign: "center"}}>
							<h1>Vitajte vo FelixBot aplikácii, {props.state.authdata.user.username}.</h1>
						</Col>
					</Row>
					<CardDeck style={{marginLeft: "20px", marginRight: "20px"}}>
						<LessonCard />
						<EventMgrCard />
					</CardDeck>
				</Container>} */}
		</div>
	)
}

export default App;