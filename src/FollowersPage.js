
import React, { Component } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, Alert, SectionList, SafeAreaView} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

class FollowersPage extends Component
{
	constructor(props)
	{
		super(props);

		this.state=
		{
			users: [],
			noResult: '',
			sections: '',
			userId: -1,
		}
	}

	componentDidMount()
	{
		this.followersReload = this.props.navigation.addListener('focus', () =>
		{
			this.findFollowers().then(null);
		});
	}

	componentWillUnmount() {
		this.followersReload();
	}

	render(){
		return(
			<View>
				<Text style={styles.title}>Followers</Text>
				<Text style={styles.noResultMessage}>{this.state.noResult}</Text>
				<SafeAreaView style={styles.scrollable}>
					<SectionList
						sections = {this.state.sections}
						keyExtractor = {(item, index) => index.toString()}
						renderItem = {({item, index}) =>
							<TouchableOpacity
								style={styles.followContainer}
								onPress={() =>
								{
									this.openProfile("" + index).then();
								}}
 							>
								<Text style={styles.user}>{item}</Text>
							</TouchableOpacity>
						}
					/>
				</SafeAreaView>
			</View>
		);
	}

	async openProfile(index)
	{
		let users =  this.state.users;
		let searchId = users[index].user_id;
		let userId = "" + await this.getId();

		console.log("DEBUG: SearchId:" + searchId + " UserId: " + userId);
		if((""+ searchId) === userId)
		{
			console.log("DEBUG: User has clicked on their own account");
			this.props.navigation.navigate('Account');
		}
		else
		{
			try
			{
				console.log("DEBUG: Storing searchId: " + searchId);

				await AsyncStorage.setItem('searchId', "" + searchId);

				console.log("DEBUG: Success, navigating to users page");
				this.props.navigation.navigate('UsersPage');
			}
			catch (e)
			{
				console.log("DEBUG: Failed to store searchId: " + e);
			}
		}
	}

	async findFollowers()
	{
		console.log("DEBUG: finding followers");

		if(this.props.route.params?.searchId)
		{
			const id = this.props.route.params.searchId;
			console.log("DEBUG: Was redirected from search page: " + id);
			await this.setState({userId: id});
		}

		let userId = this.state.userId;
		console.log("DEBUG UserId: " + userId);

		if(userId === -1)
		{
			console.log("UserID was -1, it hasn't been set yet");
			userId = await this.getId();
			await this.setState({userId: userId});
		}

		console.log("UserID:" + userId);
		let url = "http://10.0.2.2:3333/api/v0.0.5/user/" + userId + "/followers";

			return fetch(url)
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
				console.log("DEBUG: Response: " + responseJson);
				if(typeof responseJson != 'undefined' && responseJson !== "")
				{
					console.log("DEBUG: At least one user was found");
					this.setState({noResult: ""});
					this.setState({users: responseJson});
					this.getSections();
				}
				else
				{
					console.log("DEBUG: No users were found");
					this.state.sections = "";
				}
			})
			.catch((error) =>
			{
				this.state.sections = "";
				this.state.noResult = "No followers yet";
				console.log("DEBUG: " + error);
			});
	}

	async getSections()
	{
		console.log("DEBUG: Creating sections list");

		let users = this.state.users;

		//needs one extra to see if there is another page
		let length =  Object.keys(users).length;
		let response = [];
		let items = [];
		let item;

		console.log("DEBUG: Users: " + JSON.stringify(users));

		for(let i = 0; i < length; i++)
		{
			item = users[i].given_name + " " + users[i].family_name + "\n" + users[i].email;

			items.push(item);
		}

		if(length === 0)
		{
			await this.setState({noResult:"No followers yet"});
		}
		else
		{
			await this.setState({noResult: ""});
		}

		response = [{data: items}];

		//update the page with the users once done
		this.setState({sections: response});
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

export default FollowersPage;
const styles = StyleSheet.create(
	{
		error:
		{
			color: "red"
		},
		scrollable:
		{
			marginHorizontal: 40,
			marginBottom: 200
		},
		noResultMessage:
		{
			marginHorizontal: 10,
			marginTop: 50,
			textAlign: 'center',
			color: "#777",
		},
		title:
		{
			marginHorizontal: 20,
			marginTop: 20,
			fontSize: 30,
		},
		user:
		{
			marginBottom: 10,
		},
	});
