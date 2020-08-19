/*
Unit tests for /removeChannel
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

describe('/removeChannel endpoint tests', function() {
    var host = "http://localhost" + ':' + process.env.PORT;
    var path = '/removeChannel';

    // Removing channel which is in db
    it(`should remove channel present in db`, function(done) {

        // Clearing the db
        fs.writeFileSync("dummyDBdata.json", JSON.stringify({
            testWorkspace: {
                channels: {
                    testChannel1: {
                        id: "1"
                    }
                }
            }
        }));

        var body = {
            channel_name: "testChannel",
            channel_id: "1",
            team_id: "testWorkspace"
        };

        chai.request(host).post(path).set('content-type', 'application/json').send(body)
        .end(function(error, res, body) {
            res.should.have.status(200);
            expect(res.text).to.equal(`*${constants["APP_NAME"]}* was successfully removed from this channel. :+1:`);

            if (error) done(error);
            else done();
        });
    });

    // Removing channel which is not in db
    it(`should notify if channel already not in db`, function(done) {

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
            expect(res.text).to.equal(`This channel is already not in *${constants["APP_NAME"]}*'s db`);

            if (error) done(error);
            else done();
        });
    });
    
});