
import React, { Component } from 'react';
import { Text, View, StyleSheet, SectionList, Image, Button} from 'react-native';
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
			sections: '',
			};
	}

	componentDidMount()
	{
		//if focused reload the details
		this.accountReload = this.props.navigation.addListener('focus', () =>
		{
			//if a photo has been passed update the photo
			if(this.props.route.params?.photo)
			{
				this.updateProfilePhoto(this.props.route.params.photo).then();
			}
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
					style={styles.profilePhoto}
					source={{uri:this.state.photo}}
				/>
				<Button
					style={styles.changePhotoButton}
					title={'Change Photo'}
					onPress={() =>this.props.navigation.navigate('CameraPage', {profile: 'true'})}
				/>
				<Text>{this.state.errorPhoto}</Text>
				<View style={styles.detailsFlex}>
					<View>
						<Text>Forename: {this.state.forename}</Text>
						<Text>Surname: {this.state.surname}</Text>
						<Text>Email: {this.state.email}</Text>
					</View>
					<View style={styles.updateButton}>
						<Button title={'Update Details'} onPress={() => this.props.navigation.navigate('UpdateDetailsPage')}/>
					</View>
				</View>
				<View style={styles.sectionListContainer}>
					<SectionList
						sections = {this.state.sections}
						keyExtractor = {(item, index) => index}
						renderItem = {({item}) => <Text>{item}</Text>}
						renderSectionFooter={({section: {title}}) =>
							<Image
								style={{width: 60, height: 60, resizeMode: 'contain'}}
								source={{uri: title}}
							/>}
					/>
				</View>
			</View>
		);
	}

	async getId()
	{
		//gets id from storage
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

	async getDetails()
	{
		//gets the users details and then photo
		console.log("DEBUG: Getting user details");
		this.setState({userId: await this.getId()});
		let userId = this.state.userId;

		let url = "http://10.0.2.2:3333/api/v0.0.5/user/" + userId;

		console.log("DEBUG: Opening details for account user ID: " + userId);
		return fetch(url)
		.then((response) =>
		{
			if(response.status !== 200)
			{
				throw("DEBUG: Failed to get details for user: " + userId + " Response code: " + response.status);
			}
			else
			{
				return response.json();
			}
		})
		.then((responseJson) =>
		{
			let forename = (responseJson)['given_name'];
			let surname = (responseJson)['family_name'];
			let email = (responseJson)['email'];

			this.setState({userId:userId});
			this.setState({forename:forename});
			this.setState({surname:surname});
			this.setState({email:email});
			this.setState({recentChits:responseJson});

			console.log('DEBUG: userId: ' + userId + ' forename: ' + forename + ' surname: ' + surname + ' email: ' + email);
			this.getPhoto(userId);
			this.getSections((responseJson)['recent_chits'])
		})
		.catch((response) =>
		{
			this.state.errorData = response;
			console.log(response);
		});
	}

	async getSections(chits)
	{
		console.log("DEBUG: Creating sections list");

		let length =  Object.keys(chits).length;
		let response = [];

		console.log("DEBUG: Chits: " + JSON.stringify(chits));

		//only show the top 10 newest
		if(length > 10)
		{
			length = 10;
		}

		for(let i = 0; i < length; i++)
		{
			if(chits[i].hasOwnProperty('location'))
			{
				//chit itself
				let timeStamp = await new Date(chits[i].timestamp);
				timeStamp = timeStamp.toUTCString();
				let image = "http://10.0.2.2:3333/api/v0.0.5/chits/" + chits[i].chit_id + "/photo";
				console.log("DEBUG: Image: "+ image);
				response.push(
					{
						title:image,
						data:[chits[i].chit_content,
							chits[i].location.longitude,
							chits[i].location.latitude,
							timeStamp,]
					})
			}
			else
			{

				//chit itself without location data
				let image = "http://10.0.2.2:3333/api/v0.0.5/chits/" + chits[i].chit_id + "/photo";

				console.log("DEBUG: Image: "+ image);

				let timeStamp = await new Date(chits[i].timestamp);
				timeStamp = timeStamp.toUTCString();

				response.push(
					{
						title:image,
						data:[chits[i].chit_content,
							timeStamp]
					});
			}
		}
		this.setState(
			{
				sections:response
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

	async updateProfilePhoto(photo)
	{
		console.log("DEBUG: Updating user photo");

		let token = await this.getToken();
		let url = "http://10.0.2.2:3333/api/v0.0.5/user/photo";

		fetch(url,
	{
			method: 'POST',
			headers:
			{
				'X-Authorization': token,
				'Content-Type': 'application/octet-stream',
			},
			body: photo,
		})
		.catch((response) =>
		{
			this.state.errorPhoto = response;
			console.log(response);
		});
	}

	//gets token from storage
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
}
export default AccountPage;
const styles = StyleSheet.create(
{
	container:
	{
		flex: 1,
		marginHorizontal: 20,
	},
	title:
	{
		marginTop: 20,
		marginBottom: 10,
		fontSize: 30,
	},
	sectionListContainer:
	{
		height: '40%',
		marginHorizontal: 40,
		marginBottom: 10,
		marginTop: 20,
	},
	profilePhoto:
	{
		marginLeft: 'auto',
		marginRight: 'auto',
		width: 100,
		height: 100,
		resizeMode: 'contain',
		marginTop: 10,
		marginBottom: 10,
	},
	detailsFlex:
	{
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	changePhotoButton:
	{
		marginTop: 10,
		marginBottom: 10,
		width: '60%',
	},
	updateButton:
	{
		marginLeft: 'auto',
		marginRight: 'auto',
		width: '40%',
		marginTop: 10,
		marginBottom: 10,
		justifyContent: 'flex-end'
	}
});
