/*
	Author: Thomas Kavanagh
	version: 1.0
	Last updated: 18/03/2020

*/

import React, { Component } from 'react';
import { Text, View, TextInput, TouchableOpacity, StyleSheet, SectionList, SafeAreaView, Button} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

class UserSearchPage extends Component
{
	constructor(props)
	{
		super(props);

		this.state=
		{
			search: '',
			users: [],
			noResult: '',
			sections: ''
		}
	}

	render(){
		return(
			<View>
				<View style={styles.searchContainer}>
					<TextInput
						style={styles.searchBar}
						onChangeText={search => this.setState({search:search})}
						placeholder={"search username"}
					/>
					<View style={styles.buttonContainer}>
						<Button
							style={styles.searchButton}
							title='Search'
							onPress={() =>
							{
								if(this.state.search !== "")
								{
									this.searchUser().then();
								}
								else
								{
									this.setState({noResult: "No results found"});
									this.setState({sections: ""});
								}
							}}
						/>
					</View>
				</View>
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
								<Text>{item}</Text>
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

		console.log("DEBUG SearchId:" + searchId + " UserId: " + userId);
		if((""+ searchId) === userId)
		{
			console.log("DEBUG: User has clicked on their own account");
			this.props.navigation.navigate('Account').then();
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

	async searchUser()
	{
		console.log("DEBUG: search button pressed");

		let url = "http://10.0.2.2:3333/api/v0.0.5/search_user?" + "q=" + this.state.search;

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
				this.state.noResult = "";
				this.state.users = responseJson;
				this.getSections();
			}
			else
			{
				console.log("DEBUG: No users were found");
				this.state.sections = "";
				this.state.noResult = "No results found";
			}
		})
		.catch((error) =>
		{
			this.state.sections = "";
			this.state.noResult = "No results found";
			console.log("DEBUG: " + error);
		});
	}
	async getSections()
	{
		console.log("DEBUG: Creating sections list");

		let users = this.state.users;

		//needs one extra to see if there is another page
		let length =  Object.keys(users).length;
		let response;
		let items = [];
		let item;

		console.log("DEBUG: Users: " + JSON.stringify(users));

		for(let i = 0; i < length; i++)
		{
			this.state.noResult = "";

			item = users[i].given_name + " " + users[i].family_name;

			items.push(item);
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
			console.log("DEBUG: id found: " + id);
			return "" + id;
		}
		catch (e)
		{
			console.log("DEBUG: Failed to get id: " + e);
			this.props.navigation.navigate('LoginPage');
		}
	}
}

export default UserSearchPage;
const styles = StyleSheet.create(
	{
		error:
		{
			color: "red"
		},
		searchContainer:
		{
			display: 'flex',
			flexDirection: 'row',
		},
		searchBar:
		{
			flex: 4,
			borderWidth: 1,
			borderColor: '#777',
			marginLeft: 10,
			marginRight: 10,
			marginTop: 10
		},
		buttonContainer:
		{
			flex: 1,
			marginRight: 10,
			marginTop: 17
		},
		searchButton:
		{
			marginLeft: 10,
			marginRight: 10
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
		followContainer:
		{
			flexDirection: 'row',
			margin: 15,
			justifyContent: 'space-between'
		},
		followButton:
		{

		}
	});
