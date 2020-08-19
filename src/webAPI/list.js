/*
Handles the POST request made to '/list' 
by fetching all the resource names and responding
with a list with locked/available status
*/

var slackBlocksBuilderClass = require("../slack/slackBlocksBuilder");
var slackBlocksBuilder = new slackBlocksBuilderClass();

const authenticateReq = require("../slack/requestAuthentication").authenticateReq;

module.exports = function(app, db){

    // Listing out all the resources in the database
    app.post('/list', (req, res) => {

        // Request authentication
        if(process.env.reqAuthEnabled == 'true' && !authenticateReq(req)) {
            return res.status(404).send("Request not authenticated!");
        }
        
        var workSpaceId = req.body.team_id;
        var listOfResourcesPromise = db.getListOfResourcesPromise(workSpaceId);
        
        listOfResourcesPromise.then( function(listOfResources){
            // Creating the JSON response
            var blocks = slackBlocksBuilder.getListWithLockStatusBlock(listOfResources);

            if(blocks.length==0){ // Empty listOfResources
                return res.send("No resources have been added!");
            }
            else{
                var jsonRes = {
                    "blocks": blocks
                };
                return res.status(200).json(jsonRes);
            }
        })

    });
}