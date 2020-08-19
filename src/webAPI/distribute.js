/*
Handles the GET request made to '/distribute' 
by slack whenever the app is installed on a
new workspace
*/

const request = require('request');

module.exports = function(app, db){

    app.get('/distribute', (req, res) => {

        var options = {
            uri: 'https://slack.com/api/oauth.v2.access?code='
                +req.query.code+
                '&client_id='+process.env.CLIENT_ID+
                '&client_secret='+process.env.CLIENT_SECRET+
                '&redirect_uri=',
            method: 'GET'
        }

        request(options, (error, response, body) => {
            var JSONresponse = JSON.parse(body)
            if (!JSONresponse.ok){
                console.log(JSONresponse)
                res.send("Error encountered: \n"+JSON.stringify(JSONresponse)).status(200).end()
            }else{
                // Saving access token to the db
                var workSpaceId = JSONresponse.team.id;
                var accessToken = JSONresponse.access_token;
                db.encryptAndAddToken(workSpaceId, accessToken);

                res.send("Success!")
            }
        })

    });
    
}