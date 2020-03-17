import React, { Component } from 'react';
import { Text, View, TextInput, Button, StyleSheet, Alert} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

class UpdateDetailsPage extends Component
{
	constructor(props)
	{
		super(props);

		this.state={
			given_name: '',
			family_name: '',
			email: '',
			password: ''}
	}

	render(){
		return(
			<View style={styles.container}>
			<Text style={styles.error} >{this.state.registration}</Text>
			<TextInput
				style={styles.Input}
				onChangeText={forename => this.setState({given_name:forename})}
				placeholder={"forename"}
			/>
			<TextInput
				style={styles.Input}
				onChangeText={surname => this.setState({family_name:surname})}
				placeholder={"surname"}
			/>
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
				title='Update'
				onPress={() => this.submitUpdate()}
			/>
			</View>
		);
	}
	async submitUpdate()
	{
		console.log("DEBUG: Update details button pressed");

		let jsonData = JSON.stringify({
				given_name:this.state.given_name,
				family_name:this.state.family_name,
				email:this.state.email,
				password:this.state.password
			});

		let id = await this.getId();
		let token = await this.getToken();

		console.log("DEBUG: JsonData: " + jsonData);
		console.log("DEBUG: id: " + id);
		let url = "http://10.0.2.2:3333/api/v0.0.5/user/" + id;

		return fetch(url,
		{
			method:'PATCH',
			headers:
			{
				Accept: 'application/json',
				'Content-Type': 'application/json',
				'X-Authorization': token
			},
			body: jsonData
		})
		.then((response) =>
		{
			if(response.status === 201)
			{
				Alert.alert("Account Updated!");
				console.log("DEBUG: Account created, navigating to LoginPage");
				this.props.navigation.navigate('AccountPage');
			}
			else
			{
				console.log("DEBUG: Failed Response code: " + response.status);
				this.setState({registration:'Failed to update account'});
			}
		})
		 .catch((error) =>
		 {
			this.state.error = error;
			console.log("DEBUG: " + error);
		 });
	}

	async getId()
	{
		try
		{
			const id = await AsyncStorage.getItem('id');
			console.log("DEBUG: id found: " + id);
			return "" + id;
		}
		catch (e)
		{
			console.log("DEBUG: Failed to get id: " + e);
			this.props.navigation.navigate('LoginPage');
		}
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
}

export default UpdateDetailsPage;
const styles = StyleSheet.create(
	{
		container:
		{
			flex: 1,
		},
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
