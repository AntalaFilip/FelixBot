import React from 'react';
import ReactDOM from 'react-dom';
import {
	BrowserRouter as Router,
	Switch,
	Route,
} from 'react-router-dom';
import './index.css';
import ContextProvider, { Context } from './context';
import { CookiesProvider } from 'react-cookie';
import { SnackbarProvider } from 'notistack';

import Home from './main/home';
import Nav from './main/nav';
import Footer from './main/footer';
import Docs from './docs/docs';
import App from './app/app';
import Authorize from './main/authorize';
import { useContext } from 'react';
import { Backdrop, CircularProgress } from '@material-ui/core';

ReactDOM.render(
	<React.StrictMode>
		<CookiesProvider>
			<SnackbarProvider>
				<ContextProvider>
					<Router>
						<Nav />
						<Root />
						<Footer />
					</Router>
				</ContextProvider>
			</SnackbarProvider>

		</CookiesProvider>
	</React.StrictMode>,
	document.getElementById('root')
);

function Root() {
	const { rootState: state } = useContext(Context);
	return (
		state.loading ? <Backdrop open><CircularProgress/></Backdrop> :
		<div id="content" style={{ marginBottom: "88px" }}>
			<Switch>
				<Route exact path='/'>
					<Home />
					<ChangePage page={0} />
				</Route>
				<Route path='/docs'>
					<Docs />
					<ChangePage page={1} />
				</Route>
				<Route path='/app'>
					<Authorize children={<App />} />
					<ChangePage page={2} />
				</Route>
				<Route path='/discord'>
					<ChangePage page={3} />
				</Route>
			</Switch>
		</div>
	)
}

function ChangePage(props) {
	const { rootState: state, setPage } = useContext(Context);
	if (state.page !== props.page) setPage(props.page);
	return null;
}