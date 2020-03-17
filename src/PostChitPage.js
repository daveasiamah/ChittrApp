import React, { Component } from 'react';
import {View, TextInput, Button, StyleSheet, Alert, PermissionsAndroid, Image} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Geolocation from 'react-native-geolocation-service';

class ChitsPage extends Component
{
	constructor(props)
	{
		super(props);

		this.state=
		{
			chit: ' ',
			locationPermission: false,
			location: null,
			imageExists: false,
		};
	}

	componentDidMount()
	{
		this.postChitReload = this.props.navigation.addListener('focus', () =>
		{
			if(this.props.route.params?.photo)
			{
				const photo = this.props.route.params.photo;
				console.log("DEBUG: Image exists is true");
				this.setState({photo: photo.uri});
				this.setState({imageExists: true});
			}
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
				{this.state.imageExists &&
					<Image
						style={{width:100,height:100,resizeMode: 'contain'}}
						source={{uri:this.state.photo}}
					/>}
			<TextInput
				style={styles.Input}
				onChangeText={chitContent => this.setState({chit:chitContent})}
				placeholder={"Write chit here..."}
				multiline
				numberOfLines={8}
			/>
			<Button
				title='Attach Photo'
				onPress={() =>
				{
					console.log("DEBUG: Attach Photo button pressed");
					this.props.navigation.navigate("CameraPage");
				}}
			/>
			<Button
				title='Post'
				onPress={() =>
				{
					console.log("DEBUG: Button post pressed");
					this.postChit().then();
				}}
			/>
		</View>
	);}

	async postChit()
	{
		console.log("DEBUG: Posting chit");
		const token = await this.getToken();
		const location = this.state.location;
		const chitContent = this.state.chit;
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
				this.props.navigation.navigate('ChitsPage');
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
		let photo = this.props.route.params.photo;
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
			this.props.navigation.navigate('Logout');
		}
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
