/*
Authenticates if the HTTP
request is an authenticated
one from slack using the 
SIGNING SECRET
*/

const debugLogger = require("../utils/debugLogger").debugLogger;

const crypto = require('crypto');

exports.authenticateReq = function authenticateReq(req){

    var timeStamp = req.headers["x-slack-request-timestamp"];
    var slackSig = req.headers["x-slack-signature"];
    var curTime = new Date().valueOf();

    // Checking if the timestamp is recent and other fields are present
    if (timeStamp === undefined || slackSig === undefined || Math.abs((curTime/1000)-timeStamp) > 60*5){
        debugLogger("An Unauthenticated request was made to the server");
        return false;
    }

    // Generating the base string
    var sigBaseString = "v0:" + timeStamp + ':' + req.rawBody; 
    
    // Hashing
    var my_signature = "v0=" + crypto.createHmac('sha256', process.env.SIGNING_SECRET)
                            .update(sigBaseString)
                            .digest('hex');

    // Matching
    var matched = crypto.timingSafeEqual(Buffer.from(my_signature), Buffer.from(slackSig));
    
    if(matched==false) {
        debugLogger("An Unauthenticated request was made to the server");
    }
    return matched;
}