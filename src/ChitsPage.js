import React, { Component } from 'react';
import { Text, View, TextInput, Button, StyleSheet, SectionList, SafeAreaView} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

class ChitsPage extends Component
{
	constructor(props)
	{
		super(props);
		
		this.state={
			chitsStart: 0,
			chitsCount: 4,
			chits: '',
			chitNext: false
		};
		
		this.getChits();
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
						this.getChits();
					}}
				/>
				<Button 
					title='Next'
					onPress={() => 
					{
						console.log("DEBUG: Button next pressed");
						//needs to check how many chits are displayed
						let length =  Object.keys(this.state.chits).length;
						
						if(this.state.chitNext === true)
						{
							this.state.chitsStart += this.state.chitsCount;
							this.getChits();
						}
						//else theres no more pages so do nothing
					}}
				/>
			</View>
				<SafeAreaView style={styles.scrollable}>			
					<SectionList
						sections = {this.state.sections}
						keyExtractor = {(item, index) => index}
						renderItem = {({item}) => <Text>{item}</Text>}
					/>
				</SafeAreaView>
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
			if(response.status != 200)
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
					//user who posted chit
					response.push(
					{
						data:[chits[i].user.chit_content,
						chits[i].user.given_name,
						chits[i].user.family_name,
						chits[i].user.email]
					});
					
					//chit itself
					response.push(
					{
						data:[chits[i].chit_content,
						chits[i].location.longitude,
						chits[i].location.latitude,
						chits[i].timestamp]
					});
				}
				else
				{
					//user who posted chit
					response.push(
					{
						data:[chits[i].user.chit_content,
						chits[i].user.given_name,
						chits[i].user.family_name,
						chits[i].user.email]
					});
					
					//chit itself without location data
					response.push(
						{data:[chits[i].chit_content,
						chits[i].timestamp]});
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
			justifyContent: 'space-between'
		},
		scrollable: 
		{
			marginHorizontal: 40,
			marginBottom: 200
		},
	});
