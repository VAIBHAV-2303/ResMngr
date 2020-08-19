/*
Handles the POST request made to '/lock' 
locks without a modal if parameters sent,
otherwise opens up a view for further interactions
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
    
    app.post('/lock', (req, res) => {

        // Request authentication
        if(process.env.reqAuthEnabled == 'true' && !authenticateReq(req)) {
            return res.status(404).send("Request not authenticated!");
        }

        // Checking if parameters provided or not
        var params = req.body.text.split(' ');
        var userId = req.body.user_id;
        var userName = req.body.user_name;
        var workSpaceId = req.body.team_id;
        
        if(params[0]!=''){

            // Handling duration and resource name
            var duration = 4; // Deafult
            if(params.length>=2){ // Time provided
                duration = Math.ceil(params[1]);
                if(isNaN(duration)){
                    return res.send("Please enter a valid integer for duration! :upside_down_face:");
                }
            }
            // Duration should be between 1-36 hours
            if(duration<1 || duration>36){
                return res.send("Please enter an integer between *1* and *36*! :upside_down_face:");
            }
            var resourceName = params[0];

            if(!resourceMutexMap.hasOwnProperty(workSpaceId + "_" + resourceName)){
                resourceMutexMap[workSpaceId + "_" + resourceName] = new Mutex();
            }

            resourceMutexMap[workSpaceId + "_" + resourceName].acquire().then(function(release) {
                
                var listOfResourcesPromise = db.getListOfResourcesPromise(workSpaceId);
                listOfResourcesPromise.then( function(listOfResources){
                    
                    if(listOfResources != null && listOfResources.hasOwnProperty(resourceName)) { // Valid resource name
                        // If already locked
                        if(listOfResources[resourceName]["locked"]){

                            if(listOfResources[resourceName]["user_id"]==userId) {
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
                                return res.send(`Duration updated to next ${duration} hours`);
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
                                                                
                                return res.send("This resource is already locked, a personal reminder has been set for you :+1:");
                            }
                        }
                        // Logging
                        debugLogger(`${resourceName} locked by ${userName}`);
                        
                        try{
                            db.lockResource(workSpaceId, resourceName, duration, userId, userName);
                        } catch(error){
                            debugLogger("Error in db operation:", error);
                        } finally {
                            release();
                        }

                        // Announcing to channel and responding
                        var relTime = (new Date((new Date().valueOf()) + (duration+5.5)*3600000)).toUTCString() + "+530";
                        announce(workSpaceId, `Resource *${resourceName}* was locked by <@${userId}> till ${relTime}.`, db);
                        return res.send(`*${resourceName}* locked successfully for the next ${duration} hour(s). :+1:`);
                    }
                    else{
                        release();
                        return res.send("Please enter a valid resource name! :upside_down_face:");
                    }
                });
            });

            return;
        }

        // 3 dropdown interaction-Creating JSON response
        var listOfResourcesPromise = db.getListOfResourcesPromise(workSpaceId);
        listOfResourcesPromise.then( function(listOfResources){
            if(listOfResources==null || listOfResources.length==0){
                return res.send("There are no resources in the database!");
            }

            // Creating the modal
            // Env dropdown
            var [envBlock, selected_env] = slackBlocksBuilder.getEnvDropdownBlock(listOfResources);
            
            // Resname dropdown
            var resNameBlock = slackBlocksBuilder.getResNameDropdownBlock(listOfResources, selected_env);
            
            // Time dropdown
            var timeBlock = slackBlocksBuilder.getTimeDropdownBlock(1, 36, 4);

            // Assembling the view
            var view_external_id = userId + Date().valueOf();
            var blocks = [envBlock, resNameBlock, timeBlock];
            var title = "Lock a Resource";
            var view = slackBlocksBuilder.getViewWithSubmit(blocks, view_external_id, title);

            // Opening a new view
            var accessTokenPromise = db.getAccessTokenPromise(workSpaceId);
            accessTokenPromise.then( function(accessToken){
                slackApi.openView(view, req.body.trigger_id, accessToken);
            });
            
            return res.send("");
        });    
    });
    
}