import React, { Component } from 'react';
import { Text, View, TextInput, Button, StyleSheet, Alert} from 'react-native';

class RegisterPage extends Component
{
	constructor(props)
	{
		super(props);

		this.state={
			given_name: '',
			family_name: '',
			email: '',
			password: '',
			error: ''}

	}

	render(){
		return(
			<View style={styles.container}>
			<Text>Register</Text>
			<Text style={styles.error} >{this.state.error}</Text>
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
				title='Login'
				onPress={() => this.submitLogin()}
			/>
			<Button
				style={styles.loginButton}
				title='Already have an account?'
				onPress={() => this.props.navigation.navigate('LoginPage')}
			/>
			</View>
		);
	}
	submitLogin()
	{
		console.log("Submit login button pressed");

		let jsonData = JSON.stringify({
				given_name:this.state.given_name,
				family_name:this.state.family_name,
				email:this.state.email,
				password:this.state.password
			});

		console.log("JsonData: " + jsonData);

		return fetch("http://10.0.2.2:3333/api/v0.0.5/user/",
		{
			method:'POST',
			headers:
			{
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: jsonData
		})
		.then((response) => {
			if(response.status === 201)
			{
				Alert.alert("Account created!");
				console.log("Account created, navigating to LoginPage");
				this.props.navigation.navigate('LoginPage');
			}
			else
			{
				console.log("Failed Response code: " + response);
				this.setState({registration:'Failed to create account'});
			}
		})
		 .catch((error) =>
		 {
			this.state.error = error;
			console.log("DEBUG: " + error);
		 });
	}
}
export default RegisterPage;
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
