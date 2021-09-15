import React from "react";
import axios from 'axios'
import { withCookies, Cookies } from 'react-cookie';
import { instanceOf } from 'prop-types';
import { withSnackbar } from "notistack";
export const Context = React.createContext();

// Define the base URL
export const api = axios.create({
	baseURL: 'https://api.felixbot.antala.tk',
});

class ContextProvider extends React.Component {
	static propTypes = {
		cookies: instanceOf(Cookies).isRequired
	};

	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			authenticated: null,
			authdata: null,
			authpanel: false,
			theme: 'dark',
			lang: 'sk',
			domain: 'felixbot.antala.tk',
			page: 0,
		}
		this.setPage = this.setPage.bind(this);
		this.login = this.login.bind(this);
		this.logout = this.logout.bind(this);
		this.authenticate = this.authenticate.bind(this);
	}

	componentDidMount() {
		this.authenticate()
			.then(() => {
				const last = window.localStorage.getItem('lastFetched');
				const date = last ? new Date(last) : null;
				if (!date || date.getTime() + (30 * 1000) <= new Date().getTime()) {
					this.fetchLessons()
						.then(() => this.setState({ loading: false }));
				}
				else {
					this.setState({ loading: false });
				}
			});
	}

	async authenticate() {
		const { cookies } = this.props;
		const token = cookies.get('authToken', { domain: `.${this.state.domain}` });

		try {
			const res = await api.get('/auth', { headers: { "Authorization": token } });
			if (res.status === 200) {
				this.setState({
					...this.state,
					authenticated: true,
					authdata: res.data,
				});
				return res.data;
			}
		}
		catch {
			this.setState({
				authenticated: false,
				authdata: null
			});
			return;
		}
	}

	async fetchLessons() {
		const { cookies } = this.props;
		const token = cookies.get('authToken');
			if (token) {
				try {
					const res = await api.get('/lessons', { headers: { "Authorization": token } })
					if (res.status === 200) {
						window.localStorage.setItem('lessons', JSON.stringify(res.data.lessons));
						window.localStorage.setItem('lastFetched', new Date());
						return res.data.lessons;
					}
				}
				catch {
					window.localStorage.setItem('lessons', JSON.stringify([]));
					return null;
				}
			}
			else {
				this.setState({ authenticated: false });
			}
	}

	setPage(page) {
		console.log(page);
		this.setState({ page });
	}

	login() {
		window.location.replace(`https://api.${this.state.domain}/auth/token?redirect=${encodeURI(window.location.href)}`)
		return null;
	}

	logout() {
		const { cookies } = this.props;

		cookies.remove(`authToken`, { path: '/', domain: `.${this.state.domain}` });
		cookies.remove(`refreshToken`, { path: '/', domain: `.${this.state.domain}` });

		this.props.enqueueSnackbar(`Logged out!`, { variant: 'success' });

		return null;
	}

	render() {
		const contextVal = {
			rootState: this.state,
			authenticate: this.authenticate,
			setPage: this.setPage,
			login: this.login,
			logout: this.logout,
		}
		return (
			<Context.Provider value={contextVal}>
				{this.props.children}
			</Context.Provider>
		)
	}
}

export default withSnackbar(withCookies(ContextProvider));