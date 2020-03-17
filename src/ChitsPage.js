import React, { Component } from 'react';
import {Text, View, Button, StyleSheet, SectionList, SafeAreaView, Image} from 'react-native';

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
		this.followersReload = this.props.navigation.addListener('focus', () =>
		{
			this.getChits().then(null);
		});
	}

	componentWillUnmount() {
		this.followersReload();
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

						if(this.state.chitsStart >0)
						{
							if(this.state.chitsStart > 5)
							{
								this.state.chitsStart -= 5;
							}
							else
							{
								this.state.chitsStart = 0;
							}
						}
						this.getChits().then();
					}}
				/>
				<Button
					title='Next'
					onPress={() =>
					{
						console.log("DEBUG: Button next pressed");

						if(this.state.chitNext === true)
						{
							this.state.chitsStart += this.state.chitsCount;
							this.getChits().then();
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

	async getChits()
	{
		console.log("DEBUG: Getting chits");

		//needs one extra chit to see if there is another page
		return fetch("http://10.0.2.2:3333/api/v0.0.5/chits?start=" +
			this.state.chitsStart + "&count=" + this.state.chitsCount +1)
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
					timeStamp = timeStamp.toUTCString();
					let image = "http://10.0.2.2:3333/api/v0.0.5/chits/" + chits[i].chit_id + "/photo";

					response.push(
					{
						title:image,
						data:[chits[i].user.given_name,
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
					response.push(
					{
						title:image,
						data:[chits[i].user.chit_content,
						chits[i].user.given_name,
						chits[i].user.family_name,
						chits[i].user.email,
						chits[i].chit_content,
						chits[i].timestamp]
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
