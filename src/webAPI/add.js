/*
Handles the POST request made to '/add' 
by resource name validation followed by
appending the new resource to the database
followed by a success response
*/

const announce = require("../utils/announce").announce;

const debugLogger = require("../utils/debugLogger").debugLogger;

const authenticateReq = require("../slack/requestAuthentication").authenticateReq;

module.exports = function(app, db){

    // Adding a new resource to the database
    app.post('/add', (req, res) => {

        // Request authentication
        if(process.env.reqAuthEnabled == 'true' && !authenticateReq(req)) {
            return res.status(404).send("Request not authenticated!");
        }

        var resourceName = req.body.text;
        var userId = req.body.user_id;
        var workSpaceId = req.body.team_id;

        // Empty resource name
        if (resourceName == "") {
            return res.send("Please enter a valid resource name!");
        }
        // One string only
        if(resourceName.split(' ').length > 1){
            return res.send("Please enter a string with no *spaces*!");
        }
        // One _ only
        if(resourceName.split('_').length != 2){
            return res.send("Your string should be of the form *Env_Resource*!");
        }

        // Logging
        debugLogger("Resource name is valid for entry to db");

        var listOfResourcesPromise = db.getListOfResourcesPromise(workSpaceId);        
        listOfResourcesPromise.then( function(listOfResources){
            // Ensuring a unique name
            if(listOfResources != null && listOfResources.hasOwnProperty(resourceName)){
                return res.send(`Resource with the same name -> *${resourceName}* already exists.`);
            }

            // Adding to the DB
            db.addResource(workSpaceId, resourceName);

            // Logging
            debugLogger(`New resource ${resourceName} was added to the db by ${userId}`);

            // Announcing on the channels
            announce(workSpaceId, `A new resource *${resourceName}* was added by <@${userId}>.`, db);
            
            // Responding
            return res.send(`*${resourceName}* has been added successfully. :+1:`);
        });  
    });
    
}