
import React, { Component } from 'react';
import {Text, View, TextInput, Button, StyleSheet} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { BackHandler } from 'react-native';

class LoginPage extends Component
{
	constructor(props)
	{
		super(props);

		this.state={
			email: '',
			password: '',
			error: '',
		}
	}

	componentDidMount()
	{
		this.setState({error:''});
		//if they are already logged in go to the home page
		BackHandler.addEventListener('backPress', () => true);
		this.getId().then((id) =>
		{
			if(id !== 'null')
			{
				this.props.navigation.navigate('Home');
			}
		})
	}

	componentWillUnmount()
	{
		BackHandler.removeEventListener('backPress', () => true);
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
				secureTextEntry={true}
				style={styles.Input}
				onChangeText={password_data => this.setState({password:password_data})}
				placeholder={"password"}
			/>
				<View style={styles.buttonContainer}>
					<Button
						style={styles.button}
						title='Login'
						onPress={() => this.submitLogin()}
					/>
					<Button
						style={styles.button}
						title="Don't have an account?"
						onPress={() => this.props.navigation.navigate('RegisterPage')}
					/>
				</View>
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
			error: "Wrong email or password"
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
		buttonContainer:
		{
			marginLeft: 'auto',
			marginRight: 'auto',
			width: '80%',
			marginBottom: 10,
			marginTop: 20,
		},
		Input:
		{
			marginLeft: 'auto',
			marginRight: 'auto',
			width: '80%',
			borderWidth: 1,
			borderColor: '#777',
			marginBottom: 10,
		},
		error:
		{
			marginLeft: 'auto',
			marginRight: 'auto',
			color: "red"
		}
	});
