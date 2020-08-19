/*
Handles the POST request made to '/release' 
by releasing if only one resource locked
otherwise returning with a list of user 
locked resources for further interaction
*/

var slackBlocksBuilderClass = require("../slack/slackBlocksBuilder");
var slackBlocksBuilder = new slackBlocksBuilderClass();

const debugLogger = require("../utils/debugLogger").debugLogger;

const authenticateReq = require("../slack/requestAuthentication").authenticateReq;

module.exports = function(app, db){

    // Deleting a resource from the database
    app.post('/release', (req, res) => {

        // Request authentication
        if(process.env.reqAuthEnabled == 'true' && !authenticateReq(req)) {
            return res.status(404).send("Request not authenticated!");
        }
        
        var workSpaceId = req.body.team_id;
        var userId = req.body.user_id;
        var listOfResourcesPromise = db.getListOfResourcesPromise(workSpaceId);
        
        listOfResourcesPromise.then( function(listOfResources){

            // Creating the JSON response
            var blocks = slackBlocksBuilder.getListWithReleaseBlock(listOfResources, userId);
            
            // No locked resource
            if((blocks.length-2)==0){
                return res.send("You haven't locked any resources :sweat_smile:");
            }
            // Just one locked resource, release it by default
            if((blocks.length-2)==1){
                // Logging
                debugLogger(`Resource ${blocks[2]["text"]["text"]} released earlier by ${userId}`);

                db.releaseResource(workSpaceId, blocks[2]["accessory"]["action_id"].split('/')[1]);
                return res.send(blocks[2]["text"]["text"] + " has been released successfully. :+1:");
            }

            // Many locked resources
            var jsonRes = {
                "blocks": blocks
            };
            return res.status(200).json(jsonRes);
        });
    });
    
}