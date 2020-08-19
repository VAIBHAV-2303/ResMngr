/*
Unit tests for /addChannel
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

const constants = require("../src/utils/constants").constants;

describe('/addChannel endpoint tests', function() {
    var host = "http://localhost" + ':' + process.env.PORT;
    var path = '/addChannel';

    // Name validation tests
    it(`should not add ${constants["APP_NAME"]} to direct messages`, function(done) {
        var body = {
            channel_name: constants["DIRECT_MSG"],
            channel_id: "1",
            team_id: "testWorkspace"
        };

        chai.request(host).post(path).set('content-type', 'application/json').send(body)
        .end(function(error, res, body) {
            res.should.have.status(200);
            expect(res.text).to.equal(`*${constants["APP_NAME"]}* cannot be added to direct messages!`);

            if (error) done(error);
            else done();
        });
    });

    // Adding testChannel for the first time
    it(`should add testChannel when asked for first time`, function(done) {

        // Clearing the db
        fs.writeFileSync("dummyDBdata.json", JSON.stringify({}));

        var body = {
            channel_name: "testChannel",
            channel_id: "1",
            team_id: "testWorkspace"
        };

        chai.request(host).post(path).set('content-type', 'application/json').send(body)
        .end(function(error, res, body) {
            res.should.have.status(200);
            expect(res.text).to.equal(`*${constants["APP_NAME"]}* was successfully added to this channel. :+1:`);

            if (error) done(error);
            else done();
        });
    });

    // Adding testChannel for the second time
    it(`should not add testChannel when asked for second time`, function(done) {
        
        // Adding testChannel to the db
        fs.writeFileSync("dummyDBdata.json", JSON.stringify({
            testWorkspace: {
                channels: {
                    testChannel1: {
                        id: "1"
                    }
                }
            }
        }));

        // Now adding for the second time
        var body = {
            channel_name: "testChannel",
            channel_id: "1",
            team_id: "testWorkspace"
        };

        chai.request(host).post(path).set('content-type', 'application/json').send(body)
        .end(function(error, res, body) {
            res.should.have.status(200);
            expect(res.text).to.equal("Already added to this channel");

            if (error) done(error);
            else done();
        });
    });
});