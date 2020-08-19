/*
Handles the POST request made to '/hello' 
by responding with basic commands info
*/

var slackBlocksBuilderClass = require("../slack/slackBlocksBuilder");
var slackBlocksBuilder = new slackBlocksBuilderClass();

const constants = require("../utils/constants").constants;

const authenticateReq = require("../slack/requestAuthentication").authenticateReq;

module.exports = function(app){

    // Introduction to the app and its uses
    app.post('/hello', (req, res) => {
        
        // Request authentication
        if(process.env.reqAuthEnabled == 'true' && !authenticateReq(req)) {
            return res.status(404).send("Request not authenticated!");
        }

        var userId = req.body.user_id;
        var greeting = `Hello <@${userId}>, *${constants["APP_NAME"]}* is an app designed to manage resources in your team. :grinning:`;
        
        var cmds = `> Use */${constants["APP_NAME"]}add [Env_Resource]* to add a new resource.:heavy_plus_sign:\n`
            + `> Use */${constants["APP_NAME"]}list* to list out all the resources.:1234:\n`
            + `> Use */${constants["APP_NAME"]}remove* to remove a resource.:x:\n`
            + `> Use */${constants["APP_NAME"]}lock* to lock a resource.:lock:\n`
            + `> Use */${constants["APP_NAME"]}release* to release a resource early.:fast_forward:\n`
            + `> Use */add${constants["APP_NAME"]}* to get notifications in the current channel.:bell:\n`
            + `> Use */remove${constants["APP_NAME"]}* to remove ${constants["APP_NAME"]} from the current channel.:gun:\n`
        
        // Creating the JSON response
        var blocks = slackBlocksBuilder.getHelloBlock(greeting, cmds);       
        var jsonRes = {
            "blocks": blocks
        };

        return res.status(200).json(jsonRes);
    });

}