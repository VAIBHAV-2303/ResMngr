/*
Handles the POST request made to '/remove' 
by responding with the list of resources
with remove button for further interaction
*/

var slackBlocksBuilderClass = require("../slack/slackBlocksBuilder");
var slackBlocksBuilder = new slackBlocksBuilderClass();

const authenticateReq = require("../slack/requestAuthentication").authenticateReq;

module.exports = function(app, db){

    // Deleting a resource from the database
    app.post('/remove', (req, res) => {

        // Request authentication
        if(process.env.reqAuthEnabled == 'true' && !authenticateReq(req)) {
            return res.status(404).send("Request not authenticated!");
        }
        
        var workSpaceId = req.body.team_id;
        var listOfResourcesPromise = db.getListOfResourcesPromise(workSpaceId);
        
        listOfResourcesPromise.then( function(listOfResources){
            
            // Creating the JSON response
            var blocks = slackBlocksBuilder.getListWithRemoveBlock(listOfResources);
            
            if((blocks.length-2)==0){ // Empty listOfResources
                return res.send("No resources have been added to remove!");
            }
            else{
                var jsonRes = {
                    "blocks": blocks
                };
                return res.status(200).json(jsonRes);
            }
            
        });

    });
    
}