/*
Handles the POST request made to '/addChannel' 
by checking if channel is already added followed 
by appending the new channel to the database
followed by a success response
*/

var slackApiClass = require("../slack/slackApi");
var slackApi = new slackApiClass();

const debugLogger = require("../utils/debugLogger").debugLogger;

const constants = require("../utils/constants").constants;

const authenticateReq = require("../slack/requestAuthentication").authenticateReq;

module.exports = function(app, db){

    // Adding a new resource to the database
    app.post(`/addChannel`, (req, res) => {
        
        // Request authentication
        if(process.env.reqAuthEnabled == 'true' && !authenticateReq(req)) {
            return res.status(404).send("Request not authenticated!");
        }

        var workSpaceId = req.body["team_id"];
        var channelId = req.body["channel_id"];
        var channelName = req.body["channel_name"];

        if(channelName==constants["DIRECT_MSG"]) {
            return res.send(`*${constants["APP_NAME"]}* cannot be added to direct messages!`);
        }

        var addedChannelsListPromise = db.getAddedChannelsListPromise(workSpaceId);        
        addedChannelsListPromise.then( function(listOfChannels){
            // Ensuring a new channel
            if(listOfChannels != null && listOfChannels.hasOwnProperty(channelName+channelId)){
                return res.send("Already added to this channel");
            }

            // Adding to the DB
            db.addChannel(workSpaceId, channelId, channelName);

            // Logging
            debugLogger(`Channel ${channelName} was added to the db of ${workSpaceId}`);

            // Announcing on the channel
            var accessTokenPromise = db.getAccessTokenPromise(workSpaceId);
            accessTokenPromise.then( function(accessToken){
                slackApi.sendMessage(`*${constants["APP_NAME"]}* will now post notifications on this channel.`, channelId, accessToken);
            });
            
            // Responding
            return res.send(`*${constants["APP_NAME"]}* was successfully added to this channel. :+1:`);
        });
    });
    
}