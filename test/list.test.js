/*
Unit tests for /list
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

describe('/list endpoint tests', function() {
    var host = "http://localhost" + ':' + process.env.PORT;
    var path = '/list';

    // Name validation tests
    it(`should notify if list of resources is empty`, function(done) {
        
        // Clearing the db first
        fs.writeFileSync("dummyDBdata.json", JSON.stringify({}));

        var body = {
            team_id: "testWorkspace"
        };

        chai.request(host).post(path).set('content-type', 'application/json').send(body)
        .end(function(error, res, body) {
            res.should.have.status(200);
            expect(res.text).to.equal("No resources have been added!");

            if (error) done(error);
            else done();
        });
    });

});