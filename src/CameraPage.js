import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { RNCamera } from 'react-native-camera';

class ChitsPage extends Component
{
	constructor(props)
	{
		super(props);

		this.state=
		{
			photo: null,
		};

	}

	render(){
		return(
		<View>
			<RNCamera
				ref={ref =>
					{
						this.camera = ref;
					}
				}
				style={{flex:1,
					width: '100%'}}
				>
			</RNCamera>
			<View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center' }}>
			<TouchableOpacity
				onPress={this.takePicture.bind(this)}
				style={styles.capture}
					>
					<Text style={{ fontSize: 16 }}>
				Capture
				</Text>
			</TouchableOpacity>
			</View>
		</View>

	);}

	takePicture = async() =>
	{
		if (this.camera)
		{
			const options = { quality: 0.5, base64: true };
			const data = await this.camera.takePictureAsync(options);
			console.log('DEBUG: Image data' + data.uri);
			this.setState({photo: data});
		}
	};

	async storePhoto()
	{
		try
		{
			let photo = "" + this.state.photo;

			console.log("DEBUG: Storing Photo");
			await AsyncStorage.setItem('photo', photo);

			console.log("DEBUG: Success, navigating to PostChitPage");
			this.props.navigation.navigate('PostChitPage');
		}
		catch (e)
		{
			console.log("DEBUG: Failed to store id and token: " + e);
		}
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
