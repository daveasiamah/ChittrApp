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
			searchId: -1,
			sections: '',
			errorData: '',
			errorPhoto: '',
			photo: null,
			users: [],
			buttonRender: "",
			token: null,
			};
	}

	componentDidMount()
	{
		this.accountReload = this.props.navigation.addListener('focus', () =>
		{
			this.getDetails().then();
		});
	}

	componentWillUnmount()
	{
		this.accountReload();
	}

	render(){
		return(
			<View style={styles.container}>
				<Text style={styles.title}>User Details</Text>
				<View style={styles.profilePhoto}>
					<Image
						style={{width:100,height:100,resizeMode: 'contain'}}
						source={{uri:this.state.photo}}
					/>
				</View>
				<Text>{this.state.errorPhoto}</Text>
				<Text>Forename: {this.state.forename}</Text>
				<Text>Surname: {this.state.surname}</Text>
				<Text>Email: {this.state.email}</Text>
				<View>
					<TouchableOpacity
						style={styles.buttonRender}
						onPress={() => this.followUnfollow(this.state.buttonRender)}
					>
						<Text style={styles.buttonRenderText}> {this.state.buttonRender} </Text>
					</TouchableOpacity>
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

	async getSearchId()
	{
		try
		{
			const searchId = await AsyncStorage.getItem('searchId');
			console.log("DEBUG: searchId found: " + searchId);
			return "" + searchId;
		}
		catch (e)
		{
			console.log("DEBUG: No search Id set: " + e);
			return false;
		}
	}

	async followUnfollow(follow)
	{
		let searchId = this.state.searchId;
		let userId = await this.getId();
		let token = await this.getToken();
		let followMethod;

		if(follow === 'FOLLOW')
		{
			console.log("DEBUG: Following user, button says: " + follow);
			followMethod = 'POST';
		}
		else
		{
			console.log("DEBUG: unfollowing user, button says: " + follow);
			followMethod = 'DELETE';
		}

		let url = "http://10.0.2.2:3333/api/v0.0.5/user/" + searchId + "/follow";

		return fetch(url,
		{
			method:followMethod,
			headers:
			{
				'X-Authorization': token,
				'id' : userId
			}

		})
		.then((response) =>
		{
			if(response.status !== 200)
			{
				throw("DEBUG: Failed, Response was: " + response.status);
			}
			else
			{
				console.log("DEBUG: Successfully " + follow + "ed user");
				if(follow ==='FOLLOW')
				{
					console.log("DEBUG: changing button text to unfollow");
					this.setState({buttonRender :'UNFOLLOW'});
					console.log("DEBUG: Button now says: " + this.state.buttonRender);
				}
				else
				{
					console.log("DEBUG: changing button text to follow");
					this.setState({buttonRender :'FOLLOW'});
					console.log("DEBUG: Button now says: " + this.state.buttonRender);
				}
			}
		})
		.catch((response) =>
		{
			this.state.errorData = response;
			console.log("DEBUG: " + response);
		});
	}
	async getDetails()
	{
		console.log("DEBUG: UsersPage Getting user details");
		this.setState({userId: await this.getId()});
		this.setState({searchId: await this.getSearchId()});
		let id = this.state.searchId;

		if(this.state.searchId === this.state.userId)
		{
			this.props.navigation.navigate('AccountPage');
		}


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
			this.getSections((responseJson)['recent_chits']);
			this.getFollowing();
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
				response.push(
					{
						title:image,
						data:[chits[i].chit_content,
							chits[i].timestamp]
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

	async getFollowing()
	{
		console.log("DEBUG: Getting following list");

		let id = this.state.searchId;

		if(id === -1)
		{
			console.log("DEBUG: Id was -1, it hasnt be found yet");
			this.setState({searchId : await this.searchId()});
			id = this.state.searchId;
		}

		let url = "http://10.0.2.2:3333/api/v0.0.5/user/" + id + "/followers";

		return fetch(url)
		.then((response) =>
		{
			if(response.status !== 200)
			{
				this.setState({notUsersProfile: true});
				throw("DEBUG: Failed to get users");
			}
			else
			{
				return response.json();
			}
		})
		.then((response) =>
		{
			this.setState({users:response});
			console.log("DEBUG: Successfully retreieved users");
			this.matchId();
		})
		.catch((response) =>
		{
			console.log(response);
			this.state.errorData = response;
		});
	}

	async matchId()
	{
		console.log("DEBUG: Finding a matching ID");
		//gets the following and stores it in state

		let users = this.state.users;
		let length =  Object.keys(users).length;
		let userId = this.state.userId;

		if(userId === -1)
		{
			console.log("DEBUG: UserID not found yet");
			userId = await this.getId();
		}

		console.log("DEBUG: Users: " + JSON.stringify(users) + " length of array: " + length + " userId: " + userId);

		for(let i = 0; i < length; i++)
		{
			if(users[i].user_id + "" === userId)
			{
				console.log("DEBUG: User has already been followed");
				this.setState({buttonRender : "UNFOLLOW"});
				return true;
			}
		}

		console.log("DEBUG: They have not been followed yet");
		this.setState({buttonRender : "FOLLOW"});
		return false;
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
	sectionListContainer:
	{
		height: '30%',
		marginHorizontal: 40,
		marginBottom: 20,
		marginTop: 20,
	},
	profilePhoto:
	{
		marginLeft: 'auto',
		marginRight: 'auto',
		width: 100,
	},
});
