/*
	Author: Thomas Kavanagh
	version: 1.0
	Last updated: 18/03/2020

*/

import React, { Component } from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import { Alert } from 'react-native';
export default class LoginPage extends Component
{
	constructor(props)
	{
		super(props);
	}

	componentDidMount()
	{
		this.logoutReattempt = this.props.navigation.addListener('focus', () =>
		{
			this.requestLogout().then();
		});
	}

	componentWillUnmount()
	{
		//removes listener
		this.logoutReattempt();
	}

	render()
	{
		//no need for a screen
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

	async deleteDetails()
	{
		try
		{
			await AsyncStorage.removeItem('token');
			await AsyncStorage.removeItem('id');
		}
		catch(error)
		{
			console.log("DEBUG: Deleting token and id");
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
						'X-Authorization': token,
					},
			})
			.then((response) => {
				if (response.status !== 200) {
					throw "Response was: " + response.status;
				}
				else
				{
					return true;
				}
			})
			.catch((response) => {
				console.log("DEBUG: " + response);
				return false;
			});
	}

	async requestLogout()
	{
		await this.getToken().then((token) =>
			{
				this.logout(token).then((response) =>
				{
					if(response === true)
					{
						this.deleteDetails().then(() =>
						{
							console.log("DEBUG: logged out Navigating to loginpage");
							this.props.navigation.navigate('LoginPage');
						})
					}
					else
					{
						this.deleteDetails().then(() =>
						{
							console.log("DEBUG: Cannot log out Navigating to loginpage");
							this.props.navigation.navigate('LoginPage');
						})
					}
				})
			}
		);
	}
}
