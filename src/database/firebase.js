/*
firebaseDB class initializing the
reference to the db and handling direct
interactions with firebase
*/

// Firebase modules
const firebase = require("firebase/app");
require("firebase/database");

const debugLogger = require("../utils/debugLogger").debugLogger;

const encrypt = require("../utils/tokenEncryption").encrypt;
const decrypt = require("../utils/tokenEncryption").decrypt;

module.exports = class FirebaseDB {

    // initializing the firebase db
    constructor(){
        // Logging
        debugLogger("Firebase DB was initialized");

        this.config = {
            apiKey: process.env.API_KEY,
            authDomain: process.env.authDomain,
            databaseURL: process.env.databaseURL
        };
        firebase.initializeApp(this.config);
        this.db = firebase.database();
    }
    
    async getCompleteDataPromise() {
        const snapshot = await this.db.ref("/").once("value");
        const completeData = snapshot.val();
        return completeData;
    }

    async getListOfResourcesPromise(workSpaceId) {
        const snapshot = await this.db.ref(`${workSpaceId}/resources/`).once("value");
        const listOfResources = snapshot.val();
        return listOfResources;
    }

    async getAddedChannelsListPromise(workSpaceId) {
        const snapshot = await this.db.ref(`${workSpaceId}/channels/`).once("value");
        const listOfChannels = snapshot.val();
        return listOfChannels;
    }

    async getAccessTokenPromise(workSpaceId) {
        const snapshot = await this.db.ref(`${workSpaceId}/access_token/`).once("value");
        const encrypted = snapshot.val();
        var decrypted = decrypt(encrypted);
        return decrypted;
    }

    addChannel(workSpaceId, channelId, channelName) {
        this.db.ref(`${workSpaceId}/channels/${channelName+channelId}`).set({
            id: channelId
        });
    }

    removeChannel(workSpaceId, channelName, channelId) {
        this.db.ref(`${workSpaceId}/channels/${channelName+channelId}`).remove();
    }

    addResource(workSpaceId, resourceName) {
        this.db.ref(`${workSpaceId}/resources/${resourceName}`).set({
            locked: false
        });
    }
    
    removeResource(workSpaceId, resourceName){
        this.db.ref(`${workSpaceId}/resources/${resourceName}`).remove();
    }

    addReminder(workSpaceId, resourceName, userId, userName){
        this.db.ref(`${workSpaceId}/resources/${resourceName}/reminders`).push({
            user_id: userId,
            user_name: userName
        });
    }

    lockResource(workSpaceId, resourceName, duration, userId, userName){
        this.db.ref(`${workSpaceId}/resources/${resourceName}`).set({
            locked: true,
            user_id: userId,
            user_name: userName,
            duration: duration*1000*60*60, // Conversion from milliseconds to hours
            start_time: new Date().valueOf(),
            reminders: []
        });       
    }

    freeResource(workSpaceId, resourceName){
        this.db.ref(workSpaceId + '/resources/'+resourceName).set({
            name: resourceName,
            locked: false
        });
    }

    releaseResource(workSpaceId, resourceName){
        this.db.ref(`${workSpaceId}/resources/${resourceName}/`).update({
            duration: 0
        });
    }

    encryptAndAddToken(workSpaceId, accessToken) {
        var encrypted = encrypt(accessToken);
        this.db.ref(`${workSpaceId}/`).update({
            access_token: encrypted
        });
    }

    updateDuration(workSpaceId, resourceName, duration) {
        this.db.ref(`${workSpaceId}/resources/${resourceName}/`).update({
            duration: duration*1000*60*60,
            start_time: new Date().valueOf()
        });
    }
}