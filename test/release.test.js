/*
Unit tests for /remove
using chai and mocha
*/

// Setting environment variables
const dotenv = require('dotenv');
dotenv.config();

const fs = require('fs');

const expect = require('chai').expect;
var chai = require('chai');
var chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

describe('/release endpoint tests', function() {
    var host = "http://localhost" + ':' + process.env.PORT;
    var path = '/release';

    // No locked resources by the user
    it(`should notify if user has no locked resources`, function(done) {

        // Clearing the db
        fs.writeFileSync("dummyDBdata.json", JSON.stringify({}));

        var body = {
            user_id: "1",
            user_name: "testUser",
            team_id: "testWorkspace"
        };

        chai.request(host).post(path).set('content-type', 'application/json').send(body)
        .end(function(error, res, body) {
            res.should.have.status(200);
            expect(res.text).to.equal("You haven't locked any resources :sweat_smile:");

            if (error) done(error);
            else done();
        });
    });

    // Release by default if only one resource is locked
    it(`should release by default if only one resource locked`, function(done) {

        // Adding one locked resource
        fs.writeFileSync("dummyDBdata.json", JSON.stringify({
            testWorkspace: {
                resources: {
                    res_Res1: {
                        locked: true,
                        user_id: "1",
                        user_name: "testUser",
                        duration: 36*1000*60*60,
                        start_time: new Date().valueOf(),
                        reminders: []
                    }
                }
            }
        }));

        var body = {
            user_id: "1",
            user_name: "testUser",
            team_id: "testWorkspace"
        };

        chai.request(host).post(path).set('content-type', 'application/json').send(body)
        .end(function(error, res, body) {
            res.should.have.status(200);
            expect(res.text).to.equal("*res_Res1* has been released successfully. :+1:");

            if (error) done(error);
            else done();
        });
    });

});