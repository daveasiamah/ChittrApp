
import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity} from 'react-native';
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
		<View style={styles.container}>
			<RNCamera
				ref={ref =>
					{
						this.camera = ref;
					}
				}
				style={styles.preview}
				captureAudio = {false}
			>
			</RNCamera>
			<View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center' }}>
				<TouchableOpacity
					onPress={this.takePicture.bind(this)}
					style={styles.capture}
				>
					<Text style={styles.capture}>
						CAPTURE
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
			this.setState({photo: data});

			if(this.props.route.params?.profile)
			{
				//the photo is meant for the profile page
				this.props.navigation.navigate('AccountPage', {photo: data});
			}
			else
			{
				this.props.navigation.navigate('PostChitPage', {photo: data});
			}
		}
	};
}
export default ChitsPage;

const styles = StyleSheet.create(
	{
		container:
		{
			flex: 1,
			flexDirection: 'column',
		},
		preview:
		{
			flex: 1,
			justifyContent: 'flex-end',
			alignItems: 'center',
		},
		capture:
		{
			flex: 0,
			borderRadius: 5,
			padding: 15,
			paddingHorizontal: 20,
			alignSelf: 'center',
			margin: 20,
		},
	});
