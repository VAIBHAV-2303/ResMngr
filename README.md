# ResMngr

## Description

A slack application to manage resources among a team efficiently. It'll help your team keep track of which shared resources are in use and which ones aren't. You can lock a resource so that no one else from your team can use it. This project was made as a part of my internship in [Sprinklr](https://www.sprinklr.com/) in the summer of 2020.

[Github Page](https://vaibhav-2303.github.io/ResMngr/)

## Commands

* **/resmngrhello** for intorduction to the app
* **/resmngrlist** for listing out all the resources
* **/resmngradd [resource name]** for adding a new resource
* **/resmngrremove** for removing a resource
* **/resmngrlock** to lock a resource or set a reminder
* **/resmngrrelease** to release a resource earlier
* **/addresmngr** to invite resmngr to post notifications to the current channel
* **/removeresmngr** to remove resmngr from the current channel

**Note: You cannot add the bot to post notifications in direct messages.**

## Built using

* [Heroku](https://www.heroku.com/home)
* [Firebase Realtime Database](https://firebase.google.com/docs/database)
* [Slack API](https://api.slack.com)
* [NodeJS](https://nodejs.org/)
* [Mocha](https://mochajs.org/)
* [Docker](https://www.docker.com/)

To see the exact dependencies, please check package.json file.

## How To Run

* Create your own fireBase project from [Firebase](https://console.firebase.google.com), easier to setup using the GUI.

* Create a Firebase Realtime Database.

* Create ResMngr/.env file specifying your db, app credentials and server config.

```bash
# Firebase
API_KEY = ********************************
authDomain = ********************************
databaseURL = **********************************
# Slack
SIGNING_SECRET = ******************************
CLIENT_ID = *****************************
CLIENT_SECRET = *****************************
# App Config
SERVER_KEY = *************************
PORT = 3000
DEBUG_FLAG = false
reqAuthEnabled = true
DB_USED = firebase
```

* Installing required node modules, do this only if you would like to run the code on your machine.

```bash
npm install
```

* Create a new heroku app, this should give you the name of your herokuApplication.

```bash
heroku create
```

* Push the code to Heroku and run the server

```bash
# Pushing the code to Heroku server
git add .
git commit -m <message>
git push heroku master

# Running the web application
heroku ps:scale web=1

# Running the background process which frees locks who have passed their duration time
heroku ps:scale worker=1
```

* Use heroku apps:info to get the URL to your app server, use this while creating your commands in 'api.slack.com/apps/APP_ID/slah-commands', and use the url for *interaction* function in 'api.slack.com/apps/APP_ID/interactive-messages'

* To learn mode about configuring Heroku visit [getting-started-with-nodejs](https://devcenter.heroku.com/articles/getting-started-with-nodejs) and to learn more about [creating-a-slack-App](https://api.slack.com/start)

## Unit Testing

Change DB_USED to dummyDB in ResMngr/.env file for testing purposes and also make sure to set reqAuthEnabled flag to false. A separate and simple db is being used for testing.

```bash
heroku local
npm run test
```

The tests are written using mocha-chai.

## Author

* [Vaibhav Garg](https://github.com/VAIBHAV-2303)

## Mentor

* [Devashish Yadav](https://github.com/yadavdev)
