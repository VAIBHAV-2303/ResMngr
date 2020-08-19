/*
Unit tests for /lock
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

describe('/lock endpoint tests', function() {
    var host = "http://localhost" + ':' + process.env.PORT;
    var path = '/lock';

    // Invalid parameters sent, non-existent resource lock
    it(`should notify non-existent resource name in parameter`, function(done) {
        
        // Clearing the db
        fs.writeFileSync("dummyDBdata.json", JSON.stringify({}));
        
        var body = {
            text: "res_Res1 5",
            user_id: "1",
            user_name: "testUser",
            team_id: "testWorkspace"
        };

        chai.request(host).post(path).set('content-type', 'application/json').send(body)
        .end(function(error, res, body) {
            res.should.have.status(200);
            expect(res.text).to.equal("Please enter a valid resource name! :upside_down_face:");

            if (error) done(error);
            else done();
        });
    });

    // Invalid parameters sent, incorrect duration
    it(`should notify 5F.3 is not valid as duration`, function(done) {
        
        // Making sure resource exists in db
        fs.writeFileSync("dummyDBdata.json", JSON.stringify({
            testWorkspace: {
                resources: {
                    res_res1: {
                        locked: false
                    }
                }
            }
        }));
        
        var body = {
            text: "res_Res1 5F.3",
            user_id: "1",
            user_name: "testUser",
            team_id: "testWorkspace"
        };

        chai.request(host).post(path).set('content-type', 'application/json').send(body)
        .end(function(error, res, body) {
            res.should.have.status(200);
            expect(res.text).to.equal("Please enter a valid integer for duration! :upside_down_face:");

            if (error) done(error);
            else done();
        });
    });

    // Correct parameters sent
    it(`should lock resources provided valid parameters and available`, function(done) {
        
        // Making sure resource exists in db
        fs.writeFileSync("dummyDBdata.json", JSON.stringify({
            testWorkspace: {
                resources: {
                    res_Res1: {
                        locked: false
                    }
                }
            }
        }));
        
        var body = {
            text: "res_Res1 7",
            user_id: "1",
            user_name: "testUser",
            team_id: "testWorkspace"
        };

        chai.request(host).post(path).set('content-type', 'application/json').send(body)
        .end(function(error, res, body) {
            res.should.have.status(200);
            expect(res.text).to.equal(`*res_Res1* locked successfully for the next 7 hour(s). :+1:`);

            if (error) done(error);
            else done();
        });
    });

    // Set reminder check
    it(`should set reminder if resource unavailable`, function(done) {
        
        // Making sure resource is locked in db
        fs.writeFileSync("dummyDBdata.json", JSON.stringify({
            testWorkspace: {
                resources: {
                    res_Res1: {
                        locked: true,
                        user_id: "2",
                        user_name: "testUser2",
                        duration: 36*1000*60*60,
                        start_time: new Date().valueOf(),
                        reminders: []
                    }
                }
            }
        }));
        
        var body = {
            text: "res_Res1",
            user_id: "1",
            user_name: "testUser",
            team_id: "testWorkspace"
        };

        chai.request(host).post(path).set('content-type', 'application/json').send(body)
        .end(function(error, res, body) {
            res.should.have.status(200);
            expect(res.text).to.equal("This resource is already locked, a personal reminder has been set for you :+1:");

            if (error) done(error);
            else done();
        });
    });

});