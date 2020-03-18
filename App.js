/*
	Author: Thomas Kavanagh
	version: 1.0
	Last updated: 18/03/2020

*/

import 'react-native-gesture-handler';
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createDrawerNavigator} from '@react-navigation/drawer';

//screen components
import Logout from './src/Logout';
import LoginPage from './src/LoginPage';
import ChitsPage from './src/ChitsPage';
import RegisterPage from './src/RegisterPage';
import AccountPage from './src/AccountPage';
import UpdateDetailsPage from './src/UpdateDetailsPage';
import PostChitPage from './src/PostChitPage';
import UserSearchPage from './src/UserSearchPage';
import FollowersPage from './src/FollowersPage';
import FollowingPage from './src/FollowingPage';
import UsersPage from './src/UsersPage';
import CameraPage from './src/CameraPage';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

export default function Root()
{
	return(
		<NavigationContainer>
			<Drawer.Navigator initialRouteName="Home">
				<Drawer.Screen name="Home" component={ChitStack}/>
				<Drawer.Screen name="Search Users" component={SearchUserStack}/>
				<Drawer.Screen name="Followers" component={FollowersStack}/>
				<Drawer.Screen name="Following" component={FollowingStack}/>
				<Drawer.Screen name="Account" component={AccountStack}/>
				<Drawer.Screen name="Logout" component={LogStack} options={{gestureEnabled: false}}/>
			</Drawer.Navigator>
		</NavigationContainer>
	);
}

function SearchUserStack()
{
	return(
		<Stack.Navigator initialRouteName="UserSearchPage">
			<Stack.Screen
				name = "UserSearchPage"
				options={{title: "Search Users Page"}}
				component={UserSearchPage}/>
			<Stack.Screen
				name = "UsersPage"
				options={{title: "UsersPage"}}
				component={UsersPage}/>
			<Stack.Screen
				name = "Followers"
				options={{title: "FollowersPage"}}
				component={FollowersPage}/>
			<Stack.Screen
				name = "Following"
				options={{title: "Following Page"}}
				component={FollowingPage}/>
		</Stack.Navigator>
	);
}

function AccountStack()
{
	return(
		<Stack.Navigator initialRouteName="AccountPage">
			<Stack.Screen
				name = "AccountPage"
				options={{title: "Account Page"}}
				component={AccountPage}/>
			<Stack.Screen
				name = "UpdateDetailsPage"
				options={{title: "Update Details Page"}}
				component={UpdateDetailsPage}/>
		</Stack.Navigator>
	);
}


function FollowersStack()
{
	return(
		<Stack.Navigator initialRouteName="Followers">
			<Stack.Screen
				name = "UsersPage"
				options={{title: "UsersPage"}}
				component={UsersPage}/>
			<Stack.Screen
				name = "Followers"
				options={{title: "FollowersPage"}}
				component={FollowersPage}/>
		</Stack.Navigator>
	);
}

function FollowingStack()
{
	return(
		<Stack.Navigator initialRouteName="Following">
			<Stack.Screen
				name = "UsersPage"
				options={{title: "UsersPage"}}
				component={UsersPage}/>
			<Stack.Screen
				name = "Following"
				options={{title: "Following Page"}}
				component={FollowingPage}/>
		</Stack.Navigator>
	);
}

function ChitStack()
{
	return(
		<Stack.Navigator initialRouteName="ChitsPage">
			<Stack.Screen
				name = "ChitsPage"
				options={{title: "Chits Page"}}
				component={ChitsPage}/>
			<Stack.Screen
				name = "PostChitPage"
				options={{title: "Post Chit Page"}}
				component={PostChitPage}/>
			<Stack.Screen
				name = "CameraPage"
				options={{title: "Camera Page"}}
				component={CameraPage}/>
		</Stack.Navigator>
	);
}

function LogStack()
{
	return(
		<Stack.Navigator initialRouteName="Logout">
			<Stack.Screen
				name = "LoginPage"
				options={{title: "Login Page"}}
				component={LoginPage}/>
			<Stack.Screen
				name = "Logout"
				options={{title: "Logout"}}
				component={Logout}/>
			<Stack.Screen
				name = "RegisterPage"
				options={{title: "Registration Page"}}
				component={RegisterPage}/>
		</Stack.Navigator>
	);
}

