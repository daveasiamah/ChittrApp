
import React, { Component } from 'react';
import {Text, View, Button, StyleSheet, SectionList, SafeAreaView, Image} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

class ChitsPage extends Component
{
	constructor(props)
	{
		super(props);

		this.state=
		{
			chitsStart: 0,
			chitsCount: 6,
			chits: '',
			chitNext: false
		};
	}

	componentDidMount()
	{
		this.chitsReload = this.props.navigation.addListener('focus', () =>
		{
			if(this.props.route.params?.posted)
			{
				this.props.route.params.posted = null;
				console.log("DEBUG: chit was posted, refreshing");
				this.getChits(0).then();
			}
			else if(this.state.chitsStart === 0)
			{
				this.getChits(0).then();
			}
		});
		this.getId().then((id) =>
		{
			if(id === 'null' || id === null)
			{
				this.props.navigation.navigate('Logout', {screen: 'LoginPage'});
			}
		});
	}

	componentWillUnmount()
	{
		this.chitsReload();
	}

	render(){
		return(
		<View>
			<View style={styles.buttons}>
				<Button
					title='Prev'
					onPress={() =>
					{
						console.log("DEBUG: Button prev pressed");
						//prevent them going below 0
						let chitsStart = this.state.chitsStart;
						let chitsCount = this.state.chitsCount;
						console.log("DEBUG: chitsStart: " + chitsStart);
						let newChitsStart = chitsStart - (chitsCount-1);
						if(this.state.chitsStart >0)
						{
							if(this.state.chitsStart >= (chitsCount-1))
							{
								console.log(newChitsStart);
								this.getChits(newChitsStart).then();
							}
							else
							{
								//reset to 0
								this.getChits(0).then();
							}
						}

					}}
				/>
				<Button
					title='Next'
					onPress={() =>
					{
						console.log("DEBUG: Button next pressed");
						let chitsCount = this.state.chitsCount;
						let chitsStart = this.state.chitsStart;
						console.log("DEBUG: chitsStart: " + chitsStart);
						let newChitsStart = chitsStart + (chitsCount -1);
						if(this.state.chitNext === true)
						{
							//needs to be -1 due to the extra chit that isn't displayed
							console.log(newChitsStart);
							this.getChits(newChitsStart).then();
						}
						//else there's no more pages so do nothing
					}}
				/>
			</View>
				<SafeAreaView style={styles.scrollable}>
					<SectionList
						sections = {this.state.sections}
						keyExtractor = {(item, index) => index}
						renderItem = {({item}) =>
							<Text>{item}</Text>
						}
						renderSectionFooter={({section: {title}}) =>
								<Image
								style={{width: 60, height: 60, resizeMode: 'contain', marginBottom: 10}}
								source={{uri: title}}
								/>
						}
					/>
				</SafeAreaView>
			<Button
				title='Make Chit'
				style={styles.postChitButton}
				onPress={() =>
				{
					console.log("DEBUG: Make Chit button pressed");
					this.props.navigation.navigate("PostChitPage");
				}}
			/>
		</View>
	);}

	async getChits(newChitsStart)
	{
		console.log("DEBUG: Getting chits");

		//will redirect if not logged in
		this.getId();
		this.setState({chitsStart: newChitsStart});

		//needs one extra chit to see if there is another page
		return fetch("http://10.0.2.2:3333/api/v0.0.5/chits?start=" +
			newChitsStart + "&count=" + this.state.chitsCount +1)
		.then((response) =>
		{
			console.log("DEBUG: Response code: " + response.status);
			//show the chits
			if(response.status !== 200)
			{
				throw "Response was: " + response.status;
			}

			return response.json();
		})
		.then((responseJson) =>
		{

			this.setState({chits: responseJson});

			//display the data
			this.getSections();
		})
		 .catch((error) =>
		 {
			this.state.error = error;
		 });
	}

	async getSections()
	{
		console.log("DEBUG: Creating sections list");

		let chits = this.state.chits;

		//needs one extra to see if there is another page
		let length =  Object.keys(chits).length;
		let response = [];
		//false by default
		this.state.chitNext = false;

		console.log("DEBUG: Chits: " + JSON.stringify(chits));

		for(let i = 0; i < length; i++)
		{
			//dont display last chit, it was only collected to find if there is another page
			if(i < this.state.chitsCount)
			{
				if(chits[i].hasOwnProperty('location'))
				{

					//chit itself
					let timeStamp = await new Date(chits[i].timestamp);
					timeStamp = await timeStamp.toUTCString();
					let image = "http://10.0.2.2:3333/api/v0.0.5/chits/" + chits[i].chit_id + "/photo";

					response.push(
					{
						title:image,
						data:[chits[i].user.given_name,
							chits[i].user.email,
							chits[i].chit_content,
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
					timeStamp = await timeStamp.toUTCString();

					response.push(
					{
						title:image,
						data:[chits[i].user.given_name,
						chits[i].user.email,
						chits[i].user.chit_content,,
						timeStamp]
					});
				}
			}
			else
			{
				this.state.chitNext = true;
			}
		}
		this.setState(
		{
			sections:response
		});
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
			return false;
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
		buttons:
		{
			flexDirection: 'row',
			margin: 20,
			justifyContent: 'space-between',
		},
		postChitButton:
		{
			position: 'absolute',
			width: '90%',
			marginBottom: 0,
		},
		scrollable:
		{
			marginHorizontal: 40,
			marginBottom: 10,
			height: '80%',
		},
	});
