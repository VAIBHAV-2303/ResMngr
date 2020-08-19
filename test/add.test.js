/*
Unit tests for /add
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

describe('/add endpoint tests', function() {
    var host = "http://localhost" + ':' + process.env.PORT;
    var path = '/add';

    // Name validation tests
    it(`should not accept the name resRes1 and notify so`, function(done) {
        var body = {
            text: "resRes1",
            user_id: "1",
            team_id: "testWorkspace"
        };

        chai.request(host).post(path).set('content-type', 'application/json').send(body)
        .end(function(error, res, body) {
            res.should.have.status(200);
            expect(res.text).to.equal("Your string should be of the form *Env_Resource*!");

            if (error) done(error);
            else done();
        });
    });

    it(`should not accept the name res Res1 and notify so`, function(done) {
        var body = {
            text: "res Res1",
            user_id: "1",
            team_id: "testWorkspace"
        };

        chai.request(host).post(path).set('content-type', 'application/json').send(body)
        .end(function(error, res, body) {
            res.should.have.status(200);
            expect(res.text).to.equal("Please enter a string with no *spaces*!");

            if (error) done(error);
            else done();
        });
    });

    // Adding for the first time res_Res1
    it(`should accept the name res_Res1 when added for the first time`, function(done) {
        
        // Clearing the db first
        fs.writeFileSync("dummyDBdata.json", JSON.stringify({}));

        var body = {
            text: "res_Res1",
            user_id: "1",
            team_id: "testWorkspace"
        };

        chai.request(host).post(path).set('content-type', 'application/json').send(body)
        .end(function(error, res, body) {
            res.should.have.status(200);
            expect(res.text).to.equal("*res_Res1* has been added successfully. :+1:");

            if (error) done(error);
            else done();
        });
    });

    // Adding for the second time res_Res1
    it(`should not accept the name res_Res1 when added for the second time`, function(done) {
        
        // Adding res_Res1 to db for the first time
        fs.writeFileSync("dummyDBdata.json", JSON.stringify({
            testWorkspace: {
                resources: {
                    res_Res1: {
                        locked: false
                    }
                }
            }
        }));
        
        // Now adding for the second time
        var body = {
            text: "res_Res1",
            user_id: "1",
            team_id: "testWorkspace"
        };
        chai.request(host).post(path).set('content-type', 'application/json').send(body)
        .end(function(error, res, body) {
            res.should.have.status(200);
            expect(res.text).to.equal("Resource with the same name -> *res_Res1* already exists.");
            
            if (error) done(error);
            else done();
        });
    });

});