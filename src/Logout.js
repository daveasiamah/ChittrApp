import React, { Component } from 'react';
import AsyncStorage from '@react-native-community/async-storage';

export default class LoginPage extends Component
{
	constructor(props)
	{
		super(props);
		this.requestLogout();
	}

	render()
	{
		return null;
	}

	async getToken()
	{
		try
		{
			const token = await AsyncStorage.getItem('token');
			console.log("DEBUG: token found: " + token);
			return "" + token;
		}
		catch (e)
		{
			console.log("DEBUG: Failed to get id: " + e);
			this.props.navigation.navigate('LoginPage');
		}
	}

	logout(token)
	{
		console.log("DEBUG: Logging out");
		console.log("DEBUG: Using token: " + token);

		return fetch("http://10.0.2.2:3333/api/v0.0.5/logout/",
			{
				method: 'POST',
				headers:
					{
						Accept: 'application/json',
						'Content-Type': 'application/json',
						token: token,
					},
			})
			.then((response) => {
				if (response.status !== 200) {
					throw "Response was: " + response.status;
				}
			})
			.catch((response) => {
				console.log("DEBUG: " + response);
			});
	}

	requestLogout()
	{
		let token = this.getToken();
		this.logout(token).then();
		this.props.navigation.navigate('LoginPage');
	}
}
