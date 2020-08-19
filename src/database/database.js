/*
Main database class which
delegates the work to the actual
db, be it firebase, mongo, etc.
*/

// getting db to which the work will be delegated
const actualDBClass = require(`./${process.env.DB_USED}`);

module.exports = class database {

    // initialize your db configuration
    constructor(){
        this.db = new actualDBClass();
    }
    
    // Returns a promise with resolve value containing the root json object(list of all workspaces)
    async getCompleteDataPromise() {
        return this.db.getCompleteDataPromise();
    }

    // Returns a promise with resolve value containing a list of resources for the given workspaceId
    async getListOfResourcesPromise(workSpaceId) {
        return this.db.getListOfResourcesPromise(workSpaceId);
    }
    
    // Returns a promise with resolve value containing a list of added channels for the given workspaceId
    async getAddedChannelsListPromise(workSpaceId) {
        return this.db.getAddedChannelsListPromise(workSpaceId);
    }

    // Returns access token for the given workspace
    async getAccessTokenPromise(workSpaceId) {
        return this.db.getAccessTokenPromise(workSpaceId);
    }

    // adds new channelId to 'workspaceId/channels/channelName'
    addChannel(workSpaceId, channelId, channelName) {
        return this.db.addChannel(workSpaceId, channelId, channelName);
    }

    // Remove `workspaceId/channels/channelName` from db
    removeChannel(workSpaceId, channelName, channelId) {
        return this.db.removeChannel(workSpaceId, channelName, channelId);
    }

    // adds new resource to 'workspaceId/resources/resourceName'
    addResource(workSpaceId, resourceName) {
        return this.db.addResource(workSpaceId, resourceName);
    }
    
    // Removes 'workspaceId/resources/resourceName' from db
    removeResource(workSpaceId, resourceName){
        return this.db.removeResource(workSpaceId, resourceName);
    }

    // Adds user details to 'workspaceId/resources/resourceName/reminders'
    addReminder(workSpaceId, resourceName, userId, userName){
        return this.db.addReminder(workSpaceId, resourceName, userId, userName);
    }

    // Locks the resource 'workspaceId/resources/resourceName' for user
    lockResource(workSpaceId, resourceName, duration, userId, userName){
        return this.db.lockResource(workSpaceId, resourceName, duration, userId, userName);
    }

    // UnLocks the resource 'workspaceId/resources/resourceName'
    freeResource(workSpaceId, resourceName){
        return this.db.freeResource(workSpaceId, resourceName);
    }

    // Sets duration 0 for the resource 'workspaceId/resources/resourceName' so 
    // that it can be immediately
    releaseResource(workSpaceId, resourceName){
        return this.db.releaseResource(workSpaceId, resourceName);
    }

    encryptAndAddToken(workSpaceId, accessToken) {
        return this.db.encryptAndAddToken(workSpaceId, accessToken);
    }

    updateDuration(workSpaceId, resourceName, duration) {
        this.db.updateDuration(workSpaceId, resourceName, duration);
    }
}