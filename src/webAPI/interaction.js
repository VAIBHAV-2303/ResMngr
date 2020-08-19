/*
Handles all interactive components
response like remove button pressed,
lock form submitted, etc.
*/

const announce = require("../utils/announce").announce;

var slackApiClass = require("../slack/slackApi");
var slackApi = new slackApiClass();

var slackBlocksBuilderClass = require("../slack/slackBlocksBuilder");
var slackBlocksBuilder = new slackBlocksBuilderClass();

const debugLogger = require("../utils/debugLogger").debugLogger;

const authenticateReq = require("../slack/requestAuthentication").authenticateReq;

var Mutex = require('async-mutex').Mutex;

module.exports = function(app, db, resourceMutexMap){

    // Interaction end-point
    app.post('/interaction', (req, res) => {

        // Request authentication
        if(process.env.reqAuthEnabled == 'true' && !authenticateReq(req)) {
            return res.status(404).send("Request not authenticated!");
        }

        // Processing payload JSON object from request
        var payload = JSON.parse(req.body.payload);
        var workSpaceId = payload["user"]["team_id"];
        var userName = payload["user"]["username"];
        var userId = payload["user"]["id"];

        // Handling lock modal form submission, basically view-submission payloads
        if(payload["type"]=="view_submission"){ // Submitted the modal finally
            // Getting the duration and resource name
            for(var blockID in payload["view"]["state"]["values"]) {
                if(payload["view"]["state"]["values"][blockID].hasOwnProperty('resNameLock')){
                    var resourceName = payload["view"]["state"]["values"][blockID]["resNameLock"]["selected_option"]["value"];
                }
                if(payload["view"]["state"]["values"][blockID].hasOwnProperty('timeLock')){
                    var duration = parseInt(payload["view"]["state"]["values"][blockID]["timeLock"]["selected_option"]["value"]);
                }
            }

            if(!resourceMutexMap.hasOwnProperty(workSpaceId + "_" + resourceName)){
                resourceMutexMap[workSpaceId + "_" + resourceName] = new Mutex();
            }

            resourceMutexMap[workSpaceId + "_" + resourceName].acquire().then(function(release) {

                // Finding reource in the db and locking
                var listOfResourcesPromise = db.getListOfResourcesPromise(workSpaceId);
                listOfResourcesPromise.then( function(listOfResources){
                    
                    // If already locked
                    if(listOfResources[resourceName]["locked"]){

                        if(listOfResources[resourceName]["user_id"] == userId) {
                            //Logging
                            debugLogger(`Duration updated for ${resourceName} by ${userName}`);

                            try{
                                db.updateDuration(workSpaceId, resourceName, duration);
                            } catch(error){
                                debugLogger("Error in db operation:", error);
                            } finally {
                                release();
                            }

                            // Announcing
                            var relTime = (new Date((new Date().valueOf()) + (duration+5.5)*3600000)).toUTCString() + "+530";
                            announce(workSpaceId, `Resource *${resourceName}* was locked by <@${userId}> till ${relTime}.`, db);
                            var accessTokenPromise = db.getAccessTokenPromise(workSpaceId);
                            accessTokenPromise.then( function(accessToken){
                                slackApi.sendMessage(`Duration updated to next ${duration} hours`, userId, accessToken);
                            });
                        
                        }
                        else{
                            // Logging
                            debugLogger(`Reminder set for ${resourceName} by ${userName}`);
                            
                            try{
                                db.addReminder(workSpaceId, resourceName, userId, userName);
                            } catch(error){
                                debugLogger("Error in db operation:", error);
                            } finally {
                                release();
                            }

                            var accessTokenPromise = db.getAccessTokenPromise(workSpaceId);
                            accessTokenPromise.then( function(accessToken){
                                slackApi.sendMessage(`The resource *${resourceName}* is already locked, a personal reminder has been set for you :+1:`, userId, accessToken);
                            });
                        }
                    }
                    else{
                        // Logging
                        debugLogger(`${resourceName} locked by ${userName}`);

                        try{
                            db.lockResource(workSpaceId, resourceName, duration, userId, userName);
                        } catch(error){
                            debugLogger("Error in db operation:", error);
                        } finally {
                            release();
                        }

                        // Announcing to channel and the user
                        var relTime = (new Date((new Date().valueOf()) + (duration+5.5)*3600000)).toUTCString() + "+530";
                        announce(workSpaceId, `Resource *${resourceName}* was locked by <@${userId}> till ${relTime}.`, db);
                        var accessTokenPromise = db.getAccessTokenPromise(workSpaceId);
                        accessTokenPromise.then( function(accessToken){
                            slackApi.sendMessage(`*${resourceName}* locked successfully for the next ${duration} hour(s). :+1:`, userId, accessToken);
                        });
                    }
                
                });
            });
            
            // Closing the view
            return res.send("");
        }

        // Acknowledgement resoponse to block-action payloads
        res.send("Received");

        var actionType = payload["actions"][0]["action_id"].split("/")[0];

        // Update modal
        if(actionType=="envLock"){
            var newEnv = payload["actions"][0]["selected_option"]["value"]
            
            // Creating updated options for the new environment
            var listOfResourcesPromise = db.getListOfResourcesPromise(workSpaceId);
            listOfResourcesPromise.then( function(listOfResources){
                
                // Creating new resource name dropdown block due to updated environment
                var resNameBlock = slackBlocksBuilder.getResNameDropdownBlock(listOfResources, newEnv);

                // Changing the selected option of the envDropdown
                payload["view"]["blocks"][0]["accessory"]["initial_option"] = payload["actions"][0]["selected_option"];
                
                // Creating the updated view
                var blocks = [payload["view"]["blocks"][0], resNameBlock, payload["view"]["blocks"][2]];
                var title = "Lock a Resource";
                var view_external_id = payload["view"]["private_metadata"];
                var view = slackBlocksBuilder.getViewWithSubmit(blocks, view_external_id, title);
                var modal = {
                    "external_id": view_external_id,
                    "view": view
                }
                
                // Updating
                var accessTokenPromise = db.getAccessTokenPromise(workSpaceId);
                accessTokenPromise.then( function(accessToken){
                    slackApi.updateView(modal, accessToken);
                }); 
            }); 
            return;  
        }

        var resourceName = payload["actions"][0]["action_id"].split("/")[1];
        
        if (actionType == "remove") {
            // Logging
            debugLogger(`Resource ${resourceName} removed from db by ${userName}`);
              
            // Removing the resource from the database
            db.removeResource(workSpaceId, resourceName);
        
            // Announcing
            announce(workSpaceId, `Resource *${resourceName}* was removed by <@${userId}>.`, db);
            
            // Sending response back to the interaction
            var msg = `*${resourceName}* removed successfully. :+1:`
            var accessTokenPromise = db.getAccessTokenPromise(workSpaceId);
            accessTokenPromise.then( function(accessToken){
                slackApi.sendInteractionResponse(payload["response_url"], msg, accessToken);
            });
        }
        else if (actionType == "release") {
            // Logging
            debugLogger(`Resource ${resourceName} released earlier by ${userName}`);
            
            // Setting duration to 0 in the db
            db.releaseResource(workSpaceId, resourceName);

            // Sending response back to the interaction
            var msg = `*${resourceName}* has been released successfully. :+1:`
            var accessTokenPromise = db.getAccessTokenPromise(workSpaceId);
            accessTokenPromise.then( function(accessToken){
                slackApi.sendInteractionResponse(payload["response_url"], msg, accessToken);
            });
        }
    });
    
}