
import React, { Component } from 'react';
import {
	View,
	TextInput,
	Button,
	StyleSheet,
	Alert,
	PermissionsAndroid,
	Image,
	TouchableOpacity,
	SectionList, Text,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Geolocation from 'react-native-geolocation-service';

class PostChitPage extends Component
{
	constructor(props)
	{
		super(props);

		this.state=
		{
			chit: null,
			chitContent: ' ',
			locationPermission: false,
			location: null,
			imageExists: false,
			editing: false,
			chitCount: 0,
			photo: "",
			sections: null,
			chits: [],
		};
	}

	componentDidMount()
	{
		this.postChitReload = this.props.navigation.addListener('focus', () =>
		{
			if(this.props.route.params?.photo)
			{
				console.log("DEBUG: Photo has been received");
				const photo = this.props.route.params.photo;
				this.setState({photo: photo});
				this.setState({imageExists: true});
			}
			this.getSavedChits()
				.then(() =>
				{
					this.getSections().then();
				}
			);
			this.findLocation().then();
		});
	}

	componentWillUnmount()
	{
		//Resets the image for the chit
		this.postChitReload();
		this.setState({imageExists: false});
	}

	render(){
		return(
		<View>
			<Image
				style={styles.photo}
				source={{uri:this.state.photo.uri}}
			/>
			<TextInput
				style={styles.Input}
				onChangeText={chitContent => this.setState({chitContent:chitContent})}
				multiline
				numberOfLines={2}
				value = {this.state.chitContent}
				placeholder={"Write chit here..."}
			/>
			<View style={styles.buttonContainer}>
				<TouchableOpacity
					style={styles.photoButton}
					>
					<Button
						style={styles.photoButton}
						title='Attach Photo'
						onPress={() =>
						{
							console.log("DEBUG: Attach Photo button pressed");
							this.props.navigation.navigate("CameraPage");
						}}
					/>
				</TouchableOpacity>
				<TouchableOpacity
					style={styles.postButton}
				>
					<Button
						style={styles.postButton}
						title='Post Chit'
						onPress={() =>
						{
							console.log("DEBUG: Button post pressed");
							if(this.state.chitContent === null || this.state.chitContent.match(/^\s*$/) !== null)
							{
								console.log("DEBUG: Chit empty, cannot post");
								Alert.alert("Please enter a chit");
							}
							else
							{
								if (this.state.editing === true) {
									this.deleteChit(this.state.chit.save_slot).then();
									this.setState({editing: false});
								}
								this.postChit().then();
							}
						}}
					/>
				</TouchableOpacity>
				<TouchableOpacity
					style={styles.saveButton}
				>
					<Button
						style={styles.saveButton}
						title='Save'
						onPress={() =>
						{
							console.log("DEBUG: Button save pressed");
							this.saveChit().then();
						}}
					/>

				</TouchableOpacity>
				<View style={styles.sectionListContainer}>
					<SectionList
						sections = {this.state.sections}
						keyExtractor = {(item, index) => index}
						renderItem = {({item}) => <Text style={styles.sectionListItem}>{item}</Text>}
						renderSectionHeader={({section}) =>
						{
							const index = this.state.sections.indexOf(section);
							return(
								<View>
									<Button
										style={styles.sectionListButton}
										title={'Edit'}
										onPress={() =>
											this.editChit(index)}
									/>
									<Button
										style={styles.sectionListButton}
										title={'Delete'}
										onPress={() =>
											this.deleteChit(this.state.chits[index].save_slot).then(() =>
												this.getSavedChits()
													.then(() =>
														{
															this.getSections().then();
														}
													)
											)}
									/>
								</View>
								)
						}}
					/>
				</View>
			</View>
		</View>
	);}

	async postChit()
	{
		console.log("DEBUG: Posting chit");
		const token = await this.getToken();
		const location = this.state.location;
		const chitContent = this.state.chitContent;
		let longitude;
		let latitude;
		const timeStamp = Date.now();

		//checks if the chit has anything in it
		if(!chitContent.length)
		{
			//prevents user from posting an empty chit
			Alert.alert("Chit cannot be empty!");
			this.setState({imageExists: false});
			return;
		}

		if(this.state.locationPermission === true)
		{
			console.log("DEBUG: Permission was granted to use location Longitude:" + location.coords.longitude + " Latitude: " + location.coords.latitude);
			longitude = location.coords.longitude;
			latitude = location.coords.latitude;
		}
		else
		{
			longitude = 0;
			latitude = 0;
			console.log("DEBUG: Permission was not granted to use location");
		}


		const chitData =
		{
			"timestamp": timeStamp,
			"chit_content": chitContent,
			"location":
			{
				"longitude": longitude,
				"latitude": latitude
			}
		};

		const chitDataJson = JSON.stringify(chitData);

		console.log("DEBUG: " + chitData);
		console.log("DEBUG: " + JSON.stringify(chitData));

		return fetch("http://10.0.2.2:3333/api/v0.0.5/chits",
		{
			method:'POST',
			headers:
			{
				Accept: 'application/json',
				'Content-Type': 'application/json',
				'X-Authorization': token
			},
			body:chitDataJson
		})
		.then((response) =>
		{
			//show the chits
			if(response.status !== 201)
			{
				throw "Response was: " + response.status;
			}
			return response.json();
		})
		.then((response) =>
		{
			Alert.alert("Chit posted");

			if(this.state.imageExists !== true)
			{
				console.log("DEBUG: No image included, navigating to ChitsPage");
				this.props.navigation.navigate('ChitsPage', {posted:'posted'});
			}
			else
			{
				console.log("DEBUG: Response postId: " + JSON.stringify(response));
				this.setState({chitId : response.chit_id});
				this.postPhoto().then();
			}

		})
		.catch((error) =>
		{
			this.state.error = error;
			console.log("DEBUG: " + error);
		});
	}

	async postPhoto()
	{
		console.log("DEBUG: Posting Photo");

		const token = await this.getToken();
		const id = this.state.chitId;
		const url = "http://10.0.2.2:3333/api/v0.0.5/chits/" + id + "/photo";
		let photo = this.state.photo;
		console.log("DEBUG: Chit ID:" + id);
		console.log("DEBUG: Photo:" + photo);

		return fetch(url,
		{
				method:'POST',
				headers:
					{
						Accept: "application/json",
						'X-Authorization': token,
						'Content-Type': 'application/octet-stream'
					},
				body:photo
			})
			.then((response) =>
			{
				//show the chits
				if(response.status !== 201)
				{
					throw "Response was: " + response.status;
				}
			})
			.then(() =>
			{
				this.props.navigation.navigate('ChitsPage', {posted:'posted'});
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
			this.props.navigation.navigate('Logout');
		}
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

	async saveChit()
	{
		console.log("DEBUG: Saving chit");
		const chitContent = this.state.chitContent;
		const userId = await this.getId();
		let chitJson;
		let chitIndexJson = await this.getChitIndex();
		let slotFound = false;

		if(chitIndexJson !== false)
		{
			if(this.state.editing === true)
			{
				let chit = this.state.chit;
				chitJson =
					{
						"save_slot": chit.save_slot,
						"user_id": userId,
						"chit_content": chitContent,
					};

				await this.storeChit(chitIndexJson, chitJson);
				slotFound = true;
			}
			else
			{
				for (let i = 0; i < 5; i++) {
					if (chitIndexJson.saveSlotsUsed[i] === false) {
						console.log("DEBUG Empty slot: " + (i + 1) + " Found");
						//set slot to filled (indicated by a 1)
						chitIndexJson.saveSlotsUsed[i] = true;

						//indicate to the chit what slot it is saved in (1-5)
						chitJson =
							{
								"save_slot": i + 1,
								"user_id": userId,
								"chit_content": chitContent,
							};

						await this.storeChit(chitIndexJson, chitJson);
						slotFound = true;
						//exit the loop
						break;
					}
				}
			}

			if(slotFound === false)
			{
				console.log("DEBUG: No empty slot found");
				Alert.alert("Cannot have more than 5 saved chits");
			}
		}
		else
		{
			console.log("DEBUG: Cannot save chit, there are no save slots left");
		}
	}

	async getSavedChits()
	{
		console.log("DEBUG: Get saved chits called");
		const userId = await this.getId();
		let chitIndexJson;
		let chits = [];
		let chit;

		try
		{
			chitIndexJson = await this.getChitIndex();
			console.log("DEBUG: chitIndexJson" + JSON.stringify(chitIndexJson));
			let chitJson;

			for(let i = 1; i <= 5; i++)
			{
				//index is -1 since it starts at 0 not 1
				if(chitIndexJson.saveSlotsUsed[i-1] === true)
				{
					chit = await AsyncStorage.getItem("savedChit id:"+userId+" slot:"+i);
					chitJson = JSON.parse(chit);
					console.log("DEBUG: Chit:" + chitJson);
					chits.push(chitJson);
				}
			}

			await this.setState({chits: chits});
			return chits;
		}
		catch(error)
		{
			console.log("DEBUG: Failed to get chits from storage: " + error);
			return false;
		}
	}

	async deleteChit(saveSlot)
	{
		const userId = await this.getId();

		console.log("DEBUG: Deleting chit in save slot: " + saveSlot);
		try
		{
			const chitName = "savedChit id:" + userId + " slot:" + saveSlot;
			const chitIndexName = "chitIndex" + userId;
			const chitIndexJson = await this.getChitIndex(userId);
			let chitIndexStr;

			//-1 because of index starting at 0
			chitIndexJson.saveSlotsUsed[saveSlot-1] = false;
			chitIndexStr = JSON.stringify(chitIndexJson);

			console.log("DEBUG: chitIndexStr" + chitIndexStr);

			await AsyncStorage.removeItem(chitName);
			await AsyncStorage.setItem(chitIndexName,chitIndexStr);

			console.log("DEBUG: Chit successfully removed");
		}
		catch (error)
		{
			console.log("DEBUG: Failed to delete chit: " + error);
		}
	}

	async storeChit(chitIndexJson, chitJson)
	{
		try
		{
			//convert the JSON into a string ready for storage
			const userId = chitJson.user_id;
			const chitSaveSlot = chitJson.save_slot;
			const chitStr = JSON.stringify(chitJson);
			const chitIndexStr = JSON.stringify(chitIndexJson);

			console.log("DEBUG: Storing chit to slot: " + chitSaveSlot);

			await AsyncStorage.setItem('chitIndex' + userId, chitIndexStr);
			await AsyncStorage.setItem('savedChit id:' + userId + " slot:" + chitSaveSlot, chitStr);

			console.log("DEBUG: Success, chit was saved");
			Alert.alert("Chit saved");
			this.props.navigation.navigate('ChitsPage');
		}
		catch (error)
		{
			console.log("DEBUG: Failed to store chitIndex and chitStr: " + error);
			Alert.alert("Failed to store chit");
		}
	}

	async getChitIndex()
	{
		try
		{
			let notSet = false;
			const userId = await this.getId();
			let chitIndexJson;
			let chitIndexStr;

			try
			{
				chitIndexStr = await AsyncStorage.getItem('chitIndex' + userId);
				chitIndexJson = JSON.parse(chitIndexStr);

				if(chitIndexStr !== null && chitIndexStr !== 'null')
				{
					console.log("DEBUG: Index was found");
					return chitIndexJson;
				}
				else
				{
					console.log("DEBUG: Index was not found");
					notSet = true;
				}

			}
			catch(error)
			{
				console.log("DEBUG: Index not created yet");
				notSet = true;
			}

			if (notSet === true)
			{
				//5 slots available for storage, one will be filled shortly
				let chitIndexJson =
				{
					"saveSlotsUsed": [false,false,false,false,false]
				};

				//convert the json into a string ready for storage
				const chitIndexStr = JSON.stringify(chitIndexJson);

				//index has just been created
				console.log("DEBUG: Storing new index");
				await AsyncStorage.setItem('chitIndex'+userId, chitIndexStr);
				return chitIndexJson;
			}
		}
		catch (e)
		{
			console.log("DEBUG: Failed to get index: " + e);
			return false;
		}
	}

	async editChit(index)
	{
		console.log("DEBUG: Editing a chit");

		const chitJson = this.state.sections[index];
		const chitContent = "" + chitJson.data;
		this.setState({imageExists: false});
		this.setState({chit: this.state.chits[index]});
		console.log("DEBUG: chitJson content: " + chitContent);
		this.setState({chitContent: chitContent});
		this.setState({editing: true});
	}

	async getSections()
	{
		console.log("DEBUG: Creating sections list");

		const chits = this.state.chits;
		const count = chits.length;
		let chitResponse = [];

		for(let i = 0; i < count; i++)
		{
			console.log("DEBUG: chit being displayed: " + chits[i]);
			console.log("DEBUG: " + chits[i].chit_content);
			chitResponse.push(
			{
				data: [chits[i].chit_content]
			})
		}
		this.setState
		({
			sections: chitResponse
		});
	}

	findLocation = async () =>
	{
		if(!this.state.locationPermission)
		{
			//if they had not already granted it
			this.state.locationPermission = await requestLocationPermission();
		}

		async function requestLocationPermission()
		{
			try {
				const granted = await PermissionsAndroid.request(
					PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
					{
						title: 'Location Permission',
						message: 'This app requires access to your location.',
						buttonNeutral: 'Later',
						buttonNegative: 'Decline',
						buttonPositive: 'Accept',
					},
				);

				if (granted === PermissionsAndroid.RESULTS.GRANTED) {
					console.log('DEBUG: Location access was granted');
					return true;
				} else {
					console.log('DEBUG: Location access was denied');
					return false;
				}
			} catch (error) {
				console.warn("DEBUG:" + error.message);
			}
		}

		await Geolocation.getCurrentPosition((position) =>
		{
			this.state.location = position;
		},
		(error) =>
		{
			Alert.alert("Could not find location: " + error.message);
		},
{
			enableHighAccuracy: true,
			timeout: 20000,
			maximumAge: 1000
		});
	};
}
export default PostChitPage;

const styles = StyleSheet.create(
	{
		error:
		{
			color: "red"
		},
		Input:
		{
			marginLeft: 'auto',
			marginRight: 'auto',
			borderWidth: 1,
			borderColor: '#777',
			width: '80%',
		},
		saveButton:
		{
			marginBottom: 5,
			width: '60%',
		},
		photoButton:
		{
			marginTop: 10,
			marginBottom: 5,
			width: '60%',
		},
		postButton:
		{
			marginBottom: 5,
			width: '60%',
		},
		buttonContainer:
		{
			display: 'flex',
			alignItems: 'center',
		},
		sectionListContainer:
		{
			height: '52%',
			marginHorizontal: 40,
			marginBottom: 20,
			marginTop: 20,
			width: '80%',
		},
		sectionListItem:
		{
			marginBottom: 20,
		},
		sectionListButton:
		{
			flex: 1,
			flexDirection: 'row',
		},
		photo:
		{
			marginLeft: 'auto',
			marginRight: 'auto',
			height: 100,
			width: 100,
			resizeMode: 'contain',
			marginTop: 10,
			marginBottom: 10,
		}
	});
