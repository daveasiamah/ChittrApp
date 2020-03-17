import React, { Component } from 'react';
import { Text, View, StyleSheet, SectionList, Image, TouchableOpacity} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import RNFetchBlob from 'react-native-fetch-blob';

class AccountPage extends Component
{
	constructor(props)
	{
		super(props);

		this.state={
			givenName: '',
			familyName: '',
			email: '',
			password: '',
			recentChits: '',
			userId: -1,
			errorData: '',
			errorPhoto: '',
			photo: null,
			token: null,
			};
	}

	componentDidMount()
	{
		//if focused reload the details
		this.accountReload = this.props.navigation.addListener('focus', () =>
		{
			this.getDetails().then();
		});
	}

	componentWillUnmount()
	{
		//removes listener
		this.accountReload();
	}

	render(){
		return(
			<View style={styles.container}>
				<Text style={styles.title}>User Details</Text>
				<Image
					style={{width:100,height:100,resizeMode: 'contain'}}
					source={{uri:this.state.photo}}
				/>
				<Text>{this.state.errorPhoto}</Text>
				<Text>Forename: {this.state.forename}</Text>
				<Text>Surname: {this.state.surname}</Text>
				<Text>Email: {this.state.email}</Text>
				<SectionList
					sections = {this.state.sections}
					keyExtractor = {(item, index) => index}
					renderItem = {({item}) => <Text>{item}</Text>}
					renderSectionHeader = {() => <Text>Chit</Text>}
				/>
			</View>
		);
	}

	async getId()
	{
		try
		{
			const id = await AsyncStorage.getItem('id');
			console.log("DEBUG: userId found: " + id);
			return "" + id;
		}
		catch (e)
		{
			console.log("DEBUG: Failed to get id: " + e);
			this.props.navigation.navigate('Logout');
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
			this.props.navigation.navigate('Logout');
		}
	}

	async getDetails()
	{
		console.log("DEBUG: Getting user details");
		this.setState({userId: await this.getId()});
		let id = this.state.userId;

		let url = "http://10.0.2.2:3333/api/v0.0.5/user/" + id;

		console.log("DEBUG: Opening details for account user ID: " + id);
		return fetch(url)
		.then((response) =>
		{
			if(response.status !== 200)
			{
				return Promise.reject("DEBUG: Failed to get details for user: " + id + " Response code: " + response.status);
			}
			else
			{
				return response.json();
			}
		})
		.then((responseJson) =>
		{
			let userId = (responseJson)['user_id'];
			let forename = (responseJson)['given_name'];
			let surname = (responseJson)['family_name'];
			let email = (responseJson)['email'];
			let recentChits = (responseJson)['recent_chits'];

			if(this.state.searchId !== -1)
			{
				this.setState({searchId:userId});
			}
			else
			{
				this.setState({userId:userId});
			}
			this.setState({forename:forename});
			this.setState({surname:surname});
			this.setState({email:email});
			this.setState({recentChits:responseJson});

			console.log('DEBUG: userId: ' + userId + ' forename: ' + forename + ' surname: ' + surname + ' email: ' + email);
			this.getPhoto(id);
			this.getFollowing();
		})
		.catch((response) =>
		{
			this.state.errorData = response;
			console.log(response);
		});
	}

	async getPhoto(id)
	{
		console.log("DEBUG: Getting user photo");

		let url = "http://10.0.2.2:3333/api/v0.0.5/user/" + id + "/photo";

		console.log("DEBUG: opening photo for account user ID: " + id);

		RNFetchBlob.fetch('GET',url)
		.then((response) =>
		{
			let imageBase64 = response.base64();
			this.setState({photo : "data:image/png;base64," + imageBase64});
		})
		.catch((message, statusCode) =>
		{
			this.state.errorPhoto = message;
			console.log(message);
		});
	}
}
export default AccountPage;
const styles = StyleSheet.create(
{
	container:
	{
		flex: 1,
		marginHorizontal: 20,
	},
	buttonRender:
	{
		margin: 20,
		justifyContent: 'center',
		backgroundColor: 'rgb(33, 150, 243)',
		textAlign: 'center',
	},
	buttonRenderText:
	{
		margin: 20,
		justifyContent: 'center',
		textAlign: 'center',
		color: 'white'
	},
	title:
	{
		marginTop: 20,
		marginBottom: 10,
		fontSize: 30,
	},
});
