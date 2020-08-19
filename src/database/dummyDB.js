/*
dummy database for
testing purposes using 
a simple in memory JSON
object
*/

const fs = require('fs');

const debugLogger = require("../utils/debugLogger").debugLogger;

const encrypt = require("../utils/tokenEncryption").cipher;
const decrypt = require("../utils/tokenEncryption").decipher;

module.exports = class dummyDB {

    constructor(){ // Everytime the db is initialized it is completely empty
        debugLogger("dummy DB was initialized");
        this.fileName = "dummyDBdata.json";
    }

    getData() {
        let rawData = fs.readFileSync(this.fileName);
        return JSON.parse(rawData);
    }
    
    writeData(data) {
        fs.writeFileSync(this.fileName, JSON.stringify(data));
    }

    async getCompleteDataPromise() {
        return this.getData();
    }

    async getListOfResourcesPromise(workSpaceId) {
        var data = this.getData();
        if(!data.hasOwnProperty(workSpaceId)) return undefined;
        return data[workSpaceId]["resources"];
    }

    async getAddedChannelsListPromise(workSpaceId) {
        var data = this.getData();
        if(!data.hasOwnProperty(workSpaceId)) return undefined;
        return data[workSpaceId]["channels"];
    }

    async getAccessTokenPromise(workSpaceId) {
        var data = this.getData();
        var decrypted = decrypt(data[workSpaceId]["access_token"]);
        return decrypted;
    }

    addChannel(workSpaceId, channelId, channelName) {
        var data = this.getData();
        if(!data.hasOwnProperty(workSpaceId)) data[workSpaceId] = {};
        if(!data[workSpaceId].hasOwnProperty('channels')) data[workSpaceId]["channels"] = {};
        data[workSpaceId]['channels'][channelName+channelId] = {
            id: channelId
        }
        this.writeData(data);
    }

    removeChannel(workSpaceId, channelName, channelId) {
        var data = this.getData();
        delete data[workSpaceId]["channels"][channelName+channelId];
        this.writeData(data);
    }

    addResource(workSpaceId, resourceName) {
        var data = this.getData();
        if(!data.hasOwnProperty(workSpaceId)) data[workSpaceId] = {};
        if(!data[workSpaceId].hasOwnProperty("resources")) data[workSpaceId]["resources"] = {};

        data[workSpaceId]["resources"][resourceName] = {
            locked: false
        }
        this.writeData(data);
    }
    
    removeResource(workSpaceId, resourceName){
        var data = this.getData();
        delete data[workSpaceId]["resources"][resourceName];
        this.writeData(data);
    }

    addReminder(workSpaceId, resourceName, userId, userName){
        var data = this.getData();
        data[workSpaceId]["resources"][resourceName]["reminders"][userName] = {
            user_id: userId,
            user_name: userName
        };
        this.writeData(data);
    }

    lockResource(workSpaceId, resourceName, duration, userId, userName){
        var data = this.getData();
        data[workSpaceId]["resources"][resourceName] = {
            locked: true,
            user_id: userId,
            user_name: userName,
            duration: duration*1000*60*60, // Conversion from milliseconds to hours
            start_time: new Date().valueOf(),
            reminders: []
        };
        this.writeData(data);
    }

    freeResource(workSpaceId, resourceName){
        var data = this.getData();
        data[workSpaceId]["resources"][resourceName] = {
            name: resourceName,
            locked: false
        };
        this.writeData(data);
    }

    releaseResource(workSpaceId, resourceName){
        var data = this.getData();
        data[workSpaceId]["resources"][resourceName]["duration"] = 0;
        this.writeData(data);
    }

    encryptAndAddToken(workSpaceId, accessToken) {
        var data = this.getData();

        var encrypted = encrypt(accessToken);
        data[workSpaceId]["access_token"] = encrypted;
        this.writeData(data);
    }

    updateDuration(workSpaceId, resourceName, duration) {

        var data = this.getData();

        data[workSpaceId]["resources"][resourceName]["duration"] = duration*1000*60*60;
        data[workSpaceId]["resources"][resourceName]["start_time"] = new Date().valueOf();
        this.writeData(data);
    }
}