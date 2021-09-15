import React, { useContext } from 'react';
import { Card, CardActions, CardContent, Button, Typography, Backdrop } from '@material-ui/core';
import { Context } from '../context';

/**
 * 
 * @param {Object} props 
 * @param {string} [props.perms]
 * @returns 
 */
function Authorize(props) {
	const { rootState: state } = useContext(Context);
	
	const hasPerm = 
		props.perms
			? props.perms === 'teacher'
				? (state.authdata.isTeacher || state.authdata.admin)
				: props.perms === 'admin'
					? state.authdata.admin
					: true
			: true;
		;

	return (
		<>
			{hasPerm ? props.children : <AccessDenied rank={props.perms} />}
		</>
	)
}

/**
 * 
 * @param {{rank: string, login: Function}} props 
 */
function AccessDenied(props) {
	const { login, logout, rootState: state } = useContext(Context)
	return (
		<>
			<div id="accessdenied">
				<Backdrop open>
					<Card bg="warning" text="dark">
						<CardContent>
							<Typography variant="h5" color="error">
								Access denied
							</Typography>
							<Typography color="textSecondary">
								{props.rank ?
									<>You do not have permission to view this page!</>
									:
									<>You are not logged in!</>
								}
							</Typography>
							<Typography variant="body2">
								{props.rank ?
									<>Only people with the {props.rank} permission can view this page</>
									:
									<>You can only view this page when logged in</>
								}
							</Typography>
						</CardContent>
						<CardActions>
							<Button variant="outlined" onClick={() => window.history.back()}>Go back</Button>
							<Button disabled={state.authenticated} onClick={login}>Log in</Button>
							<Button disabled={!state.authenticated} onClick={logout}>Log out</Button>
						</CardActions>
					</Card>
				</Backdrop>
			</div>
		</>
	)
}

export default Authorize;