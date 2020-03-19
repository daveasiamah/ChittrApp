# ChittrApp
Twitter clone React Native application

## Server Installation
Download and install the latest version of [Node.js](https://nodejs.org/en/) 
Using the node.js command line console navigate to your installation of the server
This installation assumes you have access to a database with the needed tables
Then run:
```bash
'npm install'
```
Open up the './config/config.js' and edit the details to point to your database
Example
Host: mudfoot.doc.stu.mmu.ac.uk
Port: 6306
User: mudfoot username
Password: mudfoot password
Database: mudfoot database name
Then on the node.js command line console whilst still inside the server folder run:
```bash
'npm start'
```
If the response tells you it is listening on port 3333 then it is working
Test by navigating to http://localhost:3333/api/v.0.0.5/ 
You can test if the server is working correctly by running:
```bash
'npm test'
```

## Application Installation
Install the latest version of [Android studio](https://developer.android.com/studio)
Assuming you already have [node.js](https://nodejs.org/en/)
Run:
```bash
'npm install'
```
Set up a virtual device on Android Studio ideally on API 29. Although newer version may work.
Run the new virtual device
(assuming the server is still running) Then on the [node.js](https://nodejs.org/en/) console run:
```bash
'npx react-native run-android'
```

## Potential Issues
In some cases navigating to the android folder in the [node.js](https://nodejs.org/en/) and run:
```bash
'gradlew clean'
```
Can clean up issues in reguard to running the application when moving devices.
Sometimes the Metro server wont open properly so running the application again can fix this.