import React from 'react';
import { Cookies, withCookies } from 'react-cookie';
import { instanceOf } from 'prop-types'
import { Context } from '../context';
import { Card, CardActions, CardContent, CardHeader, CircularProgress, Grid, Typography, Button, Table, InputLabel, FormControl, Select, MenuItem, FormHelperText, makeStyles, TableContainer, Paper, TableHead, TableRow, TableCell, TableBody, Backdrop } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

const useStyles = {
	root: {
		margin: 5
	},
	headerText: {
		textAlign: 'center',
	}
};

class LessonList extends React.Component {
	static contextType = Context;

	static propTypes = {
		cookies: instanceOf(Cookies).isRequired
	}

	constructor(props) {
		super(props);
		this.state = {
			showing: `own`,
			ongoingonly: false,
			sort: true,
			loading: true,
			error: null,
			fetching: false,
		}
	}

	render() {
		return (
			<>
				{this.context.loading ? <Backdrop open={this.context.loading}><CircularProgress /></Backdrop> : this.showLessons(JSON.parse(window.localStorage.getItem('lessons')))}
			</>
		)
	}

	changeSort(sort) {
		this.setState({ sort: sort })
	}

	handleRowClick(id) {
		window.location.href = `/app/lessons/${id}`
	}

	changeShow(show) {
		this.setState({ showing: show })
	}

	changeOngoing(ongoing) {
		this.setState({ ongoingonly: ongoing })
	}

	refresh() {
		this.setState({ fetching: true });
	}

	/**
	 * 
	 * @param {[]} lessons 
	 */
	showLessons(ls) {
		const ongoing = ls.filter(ls => this.state.ongoingonly ? ls.endedAt == null : true);
		const sorted = ongoing.sort((a, b) => this.state.sort ? b.id - a.id : a.id - b.id);
		const lessons = sorted.filter(ls => this.state.showing === 'own' ? ls.teacher.member.userID === this.context.rootState.authdata.member.userID : true).filter(ls => this.state.showing === 'class' ? this.context.rootState.authdata.classTeacher.name.startsWith(ls.classid) : true);

		const { classes } = this.props;

		return (
			<Grid container spacing={6} className={classes.root}>
				<Grid item xs={12} className={classes.headerText}>
					<Typography variant="h3">Lessons</Typography>
				</Grid>
				<Grid item xs={2}>
					<Card>
						<CardHeader>
							<Typography variant="h4">Lesson list</Typography>
							<Typography variant="h5">Currently showing {lessons.length} lessons</Typography>
						</CardHeader>
						<CardContent>
							<Typography>
								{lessons.length > 0 &&
									<>
										{this.state.showing === 'own' &&
											<>
												Your {this.state.ongoingonly ? 'currently ongoing' : 'last'} lesson {this.state.ongoingonly ? 'is' : 'was'} <a href={`/app/lessons/${lessons[0].id}`}>{lessons[0].lessonid}@{lessons[0].classid}</a> with {lessons[0].students.length} students
								</>}
										{this.state.showing === 'class' &&
											<>
												The {this.state.ongoingonly ? 'currently ongoing' : 'last'} lesson in your class {this.state.ongoingonly ? 'is' : 'was'} {lessons[0].teacher.name}'s <a href={`/app/lessons/${lessons[0].id}`}>{lessons[0].lessonid}@{lessons[0].classid}</a> with {lessons[0].students.length} students
								</>}
										{this.state.showing === 'all' &&
											<>
												The {this.state.ongoingonly ? 'currently ongoing' : 'last'} lesson {this.state.ongoingonly ? 'is' : 'was'} {lessons[0].teacher.name}'s <a href={`/app/lessons/${lessons[0].id}`}>{lessons[0].lessonid}@{lessons[0].classid}</a> with {lessons[0].students.length} students
								</>}
									</>}
							</Typography>
							<FormControl>
								<InputLabel id="lessonlist-sort-select-label">Sort by</InputLabel>
								<Select
									labelId="lessonlist-sort-select-label"
									id="lessonlist-sort-select"
									value={this.state.sort}
									onChange={(e) => this.changeSort(e.target.value)}
								>
									<MenuItem value={true}>By newest</MenuItem>
									<MenuItem value={false}>By oldest</MenuItem>
								</Select>
							</FormControl>
							<br/><br/>
							<FormControl>
								<InputLabel id="lessonlist-showentity-select-label">Sort by</InputLabel>
								<Select
									labelId="lessonlist-showentity-select-label"
									id="lessonlist-showentity-select"
									value={this.state.showing}
									onChange={(e) => this.changeShow(e.target.value)}
								>
									<MenuItem disabled={!this.context.rootState.authdata.admin} value="all">Show all lessons</MenuItem>
									<MenuItem disabled={!this.context.rootState.authdata.classTeacher} value="class">Show my class's lessons</MenuItem>
									<MenuItem value="own">Show my lessons</MenuItem>
								</Select>
							</FormControl>
							<br/><br/>
							<FormControl>
								<InputLabel id="lessonlist-showentity-select-label">Sort by</InputLabel>
								<Select
									labelId="lessonlist-showongoing-select-label"
									id="lessonlist-showongoing-select"
									value={this.state.ongoingonly}
									onChange={(e) => this.changeOngoing(e.target.value)}
								>
									<MenuItem value={false}>Show all lessons</MenuItem>
									<MenuItem value={true}>Show only ongoing lessons</MenuItem>
								</Select>
							</FormControl>
							{/* <Dropdown>
								<Dropdown.Toggle variant="primary" id="sortongoing">
									Showing {this.state.ongoingonly ? 'only ongoing lessons' : 'ended and ongoing lessons'}
								</Dropdown.Toggle>
								<Dropdown.Menu>
									<Dropdown.Item active={!this.state.ongoingonly} onClick={() => this.changeOngoing(false)}>Show all lessons</Dropdown.Item>
									<Dropdown.Item active={this.state.ongoingonly} onClick={() => this.changeOngoing(true)}>Show only ongoing lessons</Dropdown.Item>
								</Dropdown.Menu>
							</Dropdown> */}
						</CardContent>
						<CardActions>
							<Button href="/app">Back to app page</Button>
						</CardActions>
					</Card>
				</Grid>
				<Grid item xl={10}>
					<TableContainer component={Paper}>
						<Table>
							<TableHead>
								<TableRow>
									<TableCell>ID</TableCell>
									<TableCell>Teacher</TableCell>
									<TableCell>Lesson</TableCell>
									<TableCell>Class</TableCell>
									<TableCell>Group</TableCell>
									<TableCell>Started</TableCell>
									<TableCell>Ended</TableCell>
									<TableCell>Students</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{lessons.map(ls => (
									<TableRow key={ls.id} onClick={e => this.handleRowClick(ls.id)}>
										<TableCell>{ls.id}</TableCell>
										<TableCell>{ls.teacher.name}</TableCell>
										<TableCell>{ls.lessonid}</TableCell>
										<TableCell>{ls.classid}</TableCell>
										<TableCell>{ls.group}</TableCell>
										<TableCell>{new Date(ls.startedAt).toLocaleDateString()} - {new Date(ls.startedAt).toLocaleTimeString()}</TableCell>
										{!ls.endedAt && <TableCell>Lesson still ongoing!</TableCell>}
										{ls.endedAt && <TableCell>{new Date(ls.endedAt).toLocaleDateString()} - {new Date(ls.endedAt).toLocaleTimeString()}</TableCell>}
										<TableCell>{ls.students.length}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				</Grid>
			</Grid>
		)
	}
}

export default withCookies(withStyles(useStyles)(LessonList));