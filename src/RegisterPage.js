
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
					secureTextEntry={true}
					style={styles.Input}
					onChangeText={password_data => this.setState({password:password_data})}
					placeholder={"password"}
				/>
				<View style={styles.buttonContainer}>
					<Button
						style={styles.loginButton}
						title='Sign Up'
						onPress={() =>
						{
							//if any are empty return false
							if(this.state.given_name.length && this.state.family_name.length &&
								this.state.email.length && this.state.password.length)
							{
								this.submitLogin().then();
							}
							else
							{
								this.setState({error:"Please fill in all details"});
							}
						}}

					/>
					<Button
						style={styles.loginButton}
						title='Already have an account?'
						onPress={() => this.props.navigation.navigate('LoginPage')}
					/>
				</View>
			</View>
		);
	}
	submitLogin()
	{
		console.log("Submit login button pressed");
		//gets login from server
		//turns jsondata into a string
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
				if(response.status === 400)
				{
					this.setState({error: "Email address already exists"});
				}
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
