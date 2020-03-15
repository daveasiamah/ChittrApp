import 'react-native-gesture-handler';
import React, { Component } from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

//screen components
import LoginPage from './src/LoginPage';
import ChitsPage from './src/ChitsPage';
import RegisterPage from './src/RegisterPage';
import AccountPage from './src/AccountPage';
import UpdateDetailsPage from './src/UpdateDetailsPage';
import PostChitPage from './src/PostChitPage';
import FollowersPage from './src/FollowersPage';

const Stack = createStackNavigator();

export default function App()
{
	return(
		<NavigationContainer>
			<Stack.Navigator>
				<Stack.Screen
					name = "FollowersPage"
					options={{title: "Followers Page"}}
					component={FollowersPage}/>
				<Stack.Screen
					name = "LoginPage"
					options={{title: "Login Page"}}
					component={LoginPage}/>
				<Stack.Screen
					name = "PostChitPage"
					options={{title: "Post Chits Page"}}
					component={PostChitPage}/>
				<Stack.Screen
					name = "ChitsPage"
					options={{title: "Chits Page"}}
					component={ChitsPage}/>
				<Stack.Screen
					name = "AccountPage"
					options={{title: "Account Page"}}
					component={AccountPage}/>
				<Stack.Screen
					name = "UpdateDetailsPage"
					options={{title: "Update Details Page"}}
					component={UpdateDetailsPage}/>
				<Stack.Screen
					name = "RegisterPage"
					options={{title: "Registration Page"}}
					component={RegisterPage}/>
			</Stack.Navigator>
		</NavigationContainer>
	);
}
