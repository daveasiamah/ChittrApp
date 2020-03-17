import React, { Component } from 'react';
import { Text, View, TextInput, Button, StyleSheet, Alert, PermissionsAndroid} from 'react-native';
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
		};
	}

	componentDidMount()
	{
		this.findLocation().then();
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
		console.log("DEBUG: Getting chits");
		const token = await this.getToken();
		const location = this.state.location;
		const chitContent = this.state.chit;
		let longitude;
		let latitude;
		const timeStamp = Date.now();

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
		.then(() =>
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

	async takePhoto()
	{

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
