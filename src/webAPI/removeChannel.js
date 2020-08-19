/*
Handles the POST request made to '/removeChannel' 
by removing the current channel from the database
followed by a success response
*/

const debugLogger = require("../utils/debugLogger").debugLogger;

const constants = require("../utils/constants").constants;

const authenticateReq = require("../slack/requestAuthentication").authenticateReq;

module.exports = function(app, db){

    // Adding a new resource to the database
    app.post(`/removeChannel`, (req, res) => {

        // Request authentication
        if(process.env.reqAuthEnabled == 'true' && !authenticateReq(req)) {
            return res.status(404).send("Request not authenticated!");
        }
        
        var workSpaceId = req.body["team_id"];
        var channelName = req.body["channel_name"];
        var channelId = req.body["channel_id"];

        var addedChannelsListPromise = db.getAddedChannelsListPromise(workSpaceId);
        addedChannelsListPromise.then( function(listOfChannels){
            // Ensuring a new channel
            if(listOfChannels != null && listOfChannels.hasOwnProperty(channelName+channelId)){
                // Removing from the db
                db.removeChannel(workSpaceId, channelName, channelId);
            
                // Logging
                debugLogger(`Channel ${channelName} was added to the db of ${workSpaceId}`);
            
                // Responding
                return res.send(`*${constants["APP_NAME"]}* was successfully removed from this channel. :+1:`);
            }
            else{
                return res.send(`This channel is already not in *${constants["APP_NAME"]}*'s db`);
            }
        });
    });
    
}