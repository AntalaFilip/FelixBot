import React from 'react';
import { api, Context } from '../context';
import { Cookies, withCookies } from 'react-cookie';
import {
	withRouter
} from 'react-router-dom';
import { Grid, Typography, Modal, Table, Button, Card, CardContent, CardHeader, CardActions, Link, InputLabel, Select, MenuItem, FormHelperText, FormControl, CircularProgress, Backdrop } from '@material-ui/core'
import { instanceOf } from 'prop-types'
import { withSnackbar } from 'notistack';
import { Alert } from '@material-ui/lab';

class ShowLesson extends React.Component {
	static contextType = Context;

	static propTypes = {
		cookies: instanceOf(Cookies).isRequired,
	}

	constructor(props) {
		super(props)
		this.state = {
			loading: true,
			data: null,
			error: null,
			sort: true,
			modals: {
				del: false,
				chan: false,
			}
		}
	}

	componentDidMount() {
		const { cookies } = this.props;
		const token = cookies.get(`authToken`);
		const id = this.props.match.params.id;
		api.get(`/lessons/${id}`, { headers: { 'Authorization': token } })
			.then(res => {
				if (res.status === 200) {
					this.setState({ loading: false, data: res.data.lesson })
				}
				else {
					this.setState({ loading: false, error: 'Something went wrong!' })
				}
			})
			.catch(err => {
				let error = 'Something went wrong!';
				if (err.response.status === 404) error = 'This lesson does not exist!';
				
				this.setState({ loading: false, error })
			});
	}

	/**
	 * 
	 * @param {Date[]} con 
	 * @param {Date[]} discon 
	 */
	timeCounter(con, discon) {

	}

	delete() {
		const { cookies } = this.props
		const token = cookies.get(`authToken`);
		this.setState({ modals: { ...this.state.modals, del: false } });
		console.log(`deleted ${this.props.match.params.id}`);
		api.delete(`/lessons/${this.props.match.params.id}`, { headers: { 'Authorization': token } })
			.then(res => {
				if (res.status === 200) {
					this.props.enqueueSnackbar(`Successfully deleted lesson ${this.props.match.params.id}`, { variant: 'success' });
					window.location.href = '/app/lessons';
				}
			})

	}

	changeSort(sort) {
		this.setState({ sort: sort });
	}

	showLesson() {
		const lesson = this.state.data;
		const students = this.state.sort ? lesson.students.sort((a, b) => a.name.slice(a.name.lastIndexOf(" ") + 1).localeCompare(b.name.slice(b.name.lastIndexOf(" ") + 1))) : lesson.students.sort((a, b) => new Date(a.voice.connects[0]).getTime() - new Date(b.voice.connects[0]).getTime());
		return (
			<>
				<Grid container spacing={6}>
					<Grid item xs={12}>
						<Typography variant="h3">
							Showing lesson: {lesson.id}
						</Typography>
					</Grid>
					<Grid item xs={6}>
						<Card>
							<CardHeader>
								<Typography variant="h4">Lesson {lesson.id}</Typography>
								<Typography variant="h5">{lesson.teacher.name}</Typography>
							</CardHeader>
							<CardContent>
								<Typography><b>Lesson:</b> {lesson.lessonid}</Typography>
								<Typography><b>Class:</b> {lesson.classid}-{lesson.group}</Typography>
								<Typography><b>Period:</b> {lesson.period}</Typography>
								<Typography><b>Lasted:</b> {new Date(lesson.startedAt).toLocaleTimeString(`en-GB`)} - {new Date(lesson.endedAt).toLocaleTimeString(`en-GB`)}</Typography>
								<Typography><b>Date:</b> {new Date(lesson.startedAt).toLocaleDateString(`en-GB`)}</Typography>
								<FormControl>
									<InputLabel id="showlesson-sort-select-label">Sort by</InputLabel>
									<Select
										labelId="showlesson-sort-select-label"
										id="showlesson-sort-select"
										value={this.state.sort}
										onChange={(e) => this.setState({ sort: e.target.value })}
									>
										<MenuItem value={true}>By names</MenuItem>
										<MenuItem value={false}>By joins</MenuItem>
									</Select>
									<FormHelperText>Select sorting strategy</FormHelperText>
								</FormControl>
								<Button variant="outlined" onClick={() => this.setState({ modals: { ...this.state.modals, chan: true } })}>Show {lesson.allocated.length} channels</Button>
								<br />
								<br />
								<Button disabled={Boolean(lesson.endedAt)} variant="outlined" color="#FFFF00">End lesson</Button>
							</CardContent>
							<CardActions>
								<Link href="../">Back to lesson list</Link>
								{this.context.rootState.authdata.admin && <Button variant="danger" onClick={() => this.setState({ modals: { ...this.state.modals, del: true } })} style={{ float: 'right' }}>Delete lesson</Button>}
							</CardActions>
						</Card>
					</Grid>
					<Grid item xs={6}>
						<Table>
							<thead>
								<tr>
									<th>Student</th>
									<th>First joined</th>
									<th>Total time</th>
									<th>Total video time</th>
								</tr>
							</thead>
							<tbody>
								{students.map(st => (
									<tr key={st.member.userID}>
										<td>{st.name}</td>
										<td>{new Date(st.voice.connects[0]).toLocaleTimeString(`en-GB`)}</td>
										<td>{st.voice.total} min</td>
										<td></td>
									</tr>
								))}
							</tbody>
						</Table>
					</Grid>
				</Grid>
				<Modal
					show={this.state.modals.del}
					onHide={() => this.setState({ modals: { ...this.state.modals, del: false } })}
					backdrop="static"
					size="sm">
					<Modal.Header closeButton>
						<Modal.Title>Really delete lesson?</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						Are you sure you want to delete this lesson?
						This action is <b><u>IRREVERSIBLE!</u></b>
					</Modal.Body>
					<Modal.Footer>
						<Button variant="danger" onClick={() => this.delete()}>Delete</Button>
						<Button variant="secondary" onClick={() => this.setState({ modals: { ...this.state.modals, del: false } })}>Cancel</Button>
					</Modal.Footer>
				</Modal>
				<Modal
					show={this.state.modals.chan}
					onHide={() => this.setState({ modals: { ...this.state.modals, chan: false } })}
					size="lg">
					<Modal.Header closeButton>
						<Modal.Title>Channels</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						{lesson.allocated.map((ch => (
							<><b>Name:</b> {ch.name}<br /></>
						)))}
					</Modal.Body>
					<Modal.Footer>
						<Button variant="secondary" onClick={() => this.setState({ modals: { ...this.state.modals, chan: false } })}>Close</Button>
					</Modal.Footer>
				</Modal>
			</>
		)
	}

	render() {
		return (
			<>
				{this.state.loading
					? <Backdrop open><CircularProgress /></Backdrop>
					: this.state.error
						?
						<Backdrop open>
							<Alert severity="error">
								<b>An error has occurred:</b>
								<br/>{this.state.error}
								<br/><br/>
								<Button variant="contained" color="secondary" onClick={() => window.history.back()}>Go back</Button>
								<Button variant="outlined" href="/app/lessons">Back to lesson list</Button>
							</Alert>
						</Backdrop>
						: this.showLesson()
				}
			</>
		)
	}
}

export default withRouter(withCookies(withSnackbar(ShowLesson)));