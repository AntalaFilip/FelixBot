import React, { useContext } from 'react';
import { AppBar, Toolbar, Tabs, Tab, Typography, makeStyles, Button, IconButton, Menu, MenuItem, LinearProgress, Avatar } from '@material-ui/core';
import { Context } from '../context';

const useStyles = makeStyles(theme => ({
	root: {
		flexGrow: 1,
	},
	brandingText: {
		marginRight: theme.spacing(2),
	},
	tabs: {
		flexGrow: 1,
	},
	userText: {
		marginLeft: theme.spacing(1),
	},
}))

function Navigator() {
	const { rootState: state, setPage, login, logout } = useContext(Context);
	const classes = useStyles();
	const changeCurrentTab = (e, val) => {
		setPage(val);
	}

	const [anchorEl, setAnchorEl] = React.useState(null);
	const open = Boolean(anchorEl);

	const openMenu = (e) => setAnchorEl(e.currentTarget);
	const closeMenu = () => setAnchorEl(null);

	return (
		<div className={classes.root}>
			<AppBar position="static">
				<Toolbar>
					<Typography variant="h5" className={classes.brandingText}>
						FELIX Discord
					</Typography>
					<Tabs
						value={state.page}
						onChange={changeCurrentTab}
						className={classes.tabs}
					>
						<Tab href="/" label="Domov" />
						<Tab href="/docs" label="Dokumentácia" />
						<Tab href="/app" label="Aplikácia" />
						<Tab href="/discord" label="Discord" />
					</Tabs>
					{state.authenticated ?
						<div>
							<IconButton
								aria-label="account of current user"
								aria-controls="menu-appbar"
								aria-haspopup="true"
								onClick={openMenu}
								color="inherit"
							>
								<Avatar src={state.authdata.user.avatarURL + '?size=32'} alt={state.authdata.member.cleanName} />
								<Typography className={classes.userText}>
									{state.authdata.member.cleanName}
								</Typography>
							</IconButton>
							{state.authdata.admin && <Typography variant="overline" color="error">Administrator</Typography>}
							<Menu
								id="menu-appbar"
								anchorEl={anchorEl}
								keepMounted
								transformOrigin={{
									vertical: -50,
									horizontal: 0
								}}
								open={open}
								onClose={closeMenu}
							>
								<MenuItem button={false}>{state.authdata.user.tag}</MenuItem>
								<MenuItem onClick={() => logout()}>Log out</MenuItem>
							</Menu>
						</div>
						:
						state.loading ?
							<LinearProgress color="secondary" style={{ flexGrow: .2 }} />
							:
							<Button onClick={() => login()} color="inherit">Login</Button>
					}
				</Toolbar>
				{/* <AppBar.Brand href="/" style={{ marginRight: "2%", marginLeft: "1%" }}>
					<img src={FelixLogo} alt="Felix Logo" width="80px" style={{ marginRight: "10px" }} />

					<img src={DiscordLogo} alt="Discord Logo" width="120px" style={{ marginLeft: "10px" }} />
				</AppBar.Brand>
				<AppBar.Toggle aria-controls="basic-navbar-nav" />
				<AppBar.Collapse id="basic-navbar-nav">
					<Nav className="mr-auto">
						<Nav.Link href="/">Domov</Nav.Link>
						<Nav.Link href="/docs">Dokumentácia</Nav.Link>
						<Nav.Link href="/app">Aplikácia</Nav.Link>
						<Nav.Link href="https://discord.gg/kKh8BeS" rel="noreferrer" target="_blank">Discord</Nav.Link>
					</Nav>
					{rootState.authenticated ?
						<NavDropdown title={<>Signed in as {rootState.authdata.user.username}</>} id="signedin-dropdown">
							<NavDropdown.Item href="/logout">Log out</NavDropdown.Item>
						</NavDropdown>
						:
						<Nav.Link href="/login">Login</Nav.Link>
					}
					{rootState.authenticated && rootState.authdata.admin && <Nav.Item style={{ color: 'red' }}>You are signed in as an administrator</Nav.Item>}
				</AppBar.Collapse> */}
			</AppBar>
		</div>
	)
}
export default Navigator;