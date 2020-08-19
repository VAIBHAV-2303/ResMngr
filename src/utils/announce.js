/*
Simply sends a message to all 
the channels(reads from the db) 
in the workspace where the app 
has been added
*/

var slackApiClass = require("../slack/slackApi");
var slackApi = new slackApiClass();

exports.announce = function announce(workSpaceId, msg, db){
    
    var addedChannelsListPromise = db.getAddedChannelsListPromise(workSpaceId);        
    addedChannelsListPromise.then( function(listOfChannels){
        
        var accessTokenPromise = db.getAccessTokenPromise(workSpaceId);
        accessTokenPromise.then( function(accessToken){
            for(var channelName in listOfChannels){
                slackApi.sendMessage(msg, listOfChannels[channelName]["id"], accessToken);
            }
        });
    
    });
}