import React, { Component } from 'react';
import { Text, View, TextInput, Button, StyleSheet, SectionList, SafeAreaView} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

class ChitsPage extends Component
{
	constructor(props)
	{
		super(props);
		
		this.state=
		{
			chit: '',
		};
		
	}
	
	render(){
		return(
		<View>
			<Text>Post New Chit</Text>
			<TextInput
				style={styles.Input}
				onChangeText={chitContent => this.setState({chit:chitContent})}
				placeholder={"Write chit here..."}
				multiline
				numberOfLines={8}
			/>
			<Button 
				title='Post'
				onPress={() => 
				{
					console.log("DEBUG: Button post pressed");
					this.postChit();
				}}
			/>
		</View>
	);}
	
	async postChit()
	{
		console.log("DEBUG: Getting chits");
		
		await constructChit();
		
		let jsonData = JSON.stringify(this.state.chit);
		let token = await this.getToken();
		
		//needs one extra chit to see if there is another page
		return fetch("http://10.0.2.2:3333/api/v0.0.5/chits",
		{
			method:'POST',
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
			console.log("DEBUG: Response code: " + response.status);
			//show the chits
			if(response.status != 201)
			{
				throw "Response was: " + response.status;
			}
			
			return response.json();
		})
		.then((responseJson) =>
		{
			Alert.alert("Chit posted");
			this.props.navigation.navigate('ChitsPage');
		})
		 .catch((error) =>
		 {
			this.state.error = error;
			console.log("DEBUG: " + error);
		 });
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
	
	async constructChit()
	{
		let response = "";
		
		
	}
}
export default ChitsPage;

const styles = StyleSheet.create(
	{
		error:
		{
			color: "red"
		},
		Input:
		{
			borderWidth: 1,
			borderColor: '#777',
		},
	});
