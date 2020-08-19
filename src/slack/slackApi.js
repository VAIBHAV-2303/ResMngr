/*
slackApi class to make all
the POST requests to slack
servers using fetch module
*/

const fetch = require('node-fetch');

const debugLogger = require("../utils/debugLogger").debugLogger;

module.exports = class slackApi {

    constructor(){}

    makePOSTRequest(url, jsonData, authentication, accessToken){
        
        var headers = {"Content-Type": "application/json"};
        if(authentication) {
            headers["Authorization"] = "Bearer " + accessToken // Token authorization
        }

        fetch(url, {
            method: 'POST', 
            headers: headers,
            body: JSON.stringify(jsonData) 
        }).then((res) => {
            return res.json();
        }).then((json) => {
            // Logging
            debugLogger(`Response from a POST request\n ${json}`);
        });
    }
    
    sendMessage(msg, channel_id, accessToken){
        
        var jsonRes = {
            "channel": channel_id,
            "text": msg,
            "link_names": true
        };
        this.makePOSTRequest("https://slack.com/api/chat.postMessage", jsonRes, true, accessToken);
    }

    sendInteractionResponse(response_url, msg) {
        
        var jsonRes = {
            "replace_original": "true",
            "text": msg 
        };
        this.makePOSTRequest(response_url, jsonRes, false);
    }

    openView(modal, triggerId, accessToken){

        var jsonRes = {
            "trigger_id": triggerId,
            "view": modal
        }
        this.makePOSTRequest("https://slack.com/api/views.open", jsonRes, true, accessToken);
    }

    updateView(modal, accessToken) {
        this.makePOSTRequest("https://slack.com/api/views.update", modal, true, accessToken);
    }
    
}