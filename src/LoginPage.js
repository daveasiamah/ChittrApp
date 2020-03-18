/*
	Author: Thomas Kavanagh
	version: 1.0
	Last updated: 18/03/2020

*/

import React, { Component } from 'react';
import {Text, View, TextInput, Button, StyleSheet} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

class LoginPage extends Component
{
	constructor(props)
	{
		super(props);

		this.state={
			email: '',
			password: '',
		}
	}

	componentDidMount()
	{
		//if they are already logged in go to the home page
		this.getId().then((response) =>
		{
			if(response !== 'null')
			{
				this.props.navigation.navigate('Home');
			}
		})
	}

	render(){
		return(
			<View>
			<Text style={styles.error} >{this.state.error}</Text>
			<TextInput
				style={styles.Input}
				onChangeText={email_data => this.setState({email:email_data})}
				placeholder={"email@email.com"}
			/>
			<TextInput
				style={styles.Input}
				onChangeText={password_data => this.setState({password:password_data})}
				placeholder={"password"}
			/>
			<Button
				style={styles.loginButton}
				title='Login'
				onPress={() => this.submitLogin()}
			/>
			<Button
				style={styles.loginButton}
				title='Sign up'
				onPress={() => this.props.navigation.navigate('RegisterPage')}
			/>
			</View>
		);
	}

	async storeLogin()
	{
		try
		{
			let id = "" + this.state.id;
			let token = "" + this.state.token;

			console.log("DEBUG: Storing ID: " + id + " Storing token: " + token);

			await AsyncStorage.setItem('id', id);
			await AsyncStorage.setItem('token', token);

			console.log("DEBUG: Success, navigating to ChitsPage");
			this.props.navigation.navigate('Home');
		}
		catch (e)
		{
			console.log("DEBUG: Failed to store id and token: " + e);
		}
	}

	submitLogin()
	{
		console.log("DEBUG: Submit login button pressed");

		let jsonData = JSON.stringify({
				email:this.state.email,
				password:this.state.password
			});

		console.log("DEBUG: JsonData: " + jsonData);

		return fetch("http://10.0.2.2:3333/api/v0.0.5/login/",
		{
			method:'POST',
			headers:
			{
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: jsonData
		})
		.then((response) =>
		{
			if(response.status !== 200)
			{
				throw "Response was: " + response.status;
			}
			return response.json();
		})
		.then((responseJson) =>
		{
			console.log("DEBUG: ResponseJson: " + responseJson);
			let idRequest = (responseJson)['id'];
			let tokenRequest = (responseJson)['token'];

			console.log("DEBUG: id received: " + idRequest +" token received " + tokenRequest);

			this.setState({id:idRequest});
			this.setState({token:tokenRequest});

			this.storeLogin().then();
		})
		.catch((error) =>
		{
			this.setState
		({
			loginData: "Failed to log in: " + error
		});
			console.log("DEBUG: " + error);
		});
	}

	async getId()
	{
		try
		{
			const id = await AsyncStorage.getItem('id');
			console.log("DEBUG: userId found: " + id);
			return id + "" ;
		}
		catch (e)
		{
			console.log("DEBUG: Failed to get userId: " + e);
			this.props.navigation.navigate('Logout');
		}
	}
}
export default LoginPage;
const styles = StyleSheet.create(
	{
		loginButton:
		{
			margin: 20,
			justifyContent: 'center'
		},
		Input:
		{
			borderWidth: 1,
			borderColor: '#777'
		},
		error:
		{
			color: "red"
		}
	});
