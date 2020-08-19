/*
Keeps running as a worker process in background
to release resources that are past their duration
Loops over all the resources over all the workspaces
every 3 seconds
*/

// Setting environment variables
const dotenv = require('dotenv');
dotenv.config();

// getting db reference
var DBClass = require("../database/database");
var db = new DBClass();

var slackApiClass = require("../slack/slackApi");
var slackApi = new slackApiClass();

const announce = require("../utils/announce").announce;

const debugLogger = require("../utils/debugLogger").debugLogger;

const decrypt = require('./tokenEncryption').decrypt;

// Routine check to release locks
setInterval(function() {

  // Logging
  // debugLogger("Worker loop to free resources started running in the BackGround");

  var completeDataPromise = db.getCompleteDataPromise();
  completeDataPromise.then( function(completeData){
    
    for(var workSpaceId in completeData){
      listOfResources = completeData[workSpaceId]["resources"];

      var accessToken = decrypt(completeData[workSpaceId]["access_token"]);

      var currTime = new Date().valueOf();
      for (var resourceName in listOfResources) {
        if (listOfResources[resourceName]["locked"]) {

          // Check whether time is up
          if(listOfResources[resourceName]["start_time"] + listOfResources[resourceName]["duration"] < currTime){      
            
            // Sending reminder messages to the users  
            for(var user in listOfResources[resourceName]["reminders"]) {
              slackApi.sendMessage(`*${resourceName}* has been released and is ready for use. :grinning:`, listOfResources[resourceName]["reminders"][user]["user_id"], accessToken);
            }

            // Announcing on the channel
            announce(workSpaceId, `Resource *${resourceName}* is ready to use.`, db);

            // Marking the resource as free in the db
            db.freeResource(workSpaceId, resourceName);
          }
        }
      }
    }
  });
}, 3000);