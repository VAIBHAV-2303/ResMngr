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

describe('/remove endpoint tests', function() {
    var host = "http://localhost" + ':' + process.env.PORT;
    var path = '/remove';

    // No resources present in db
    it(`should notify when db is empty, so no resource to remove`, function(done) {

        // Clearing the db
        fs.writeFileSync("dummyDBdata.json", JSON.stringify({}));

        var body = {};

        chai.request(host).post(path).set('content-type', 'application/json').send(body)
        .end(function(error, res, body) {
            res.should.have.status(200);
            expect(res.text).to.equal("No resources have been added to remove!");

            if (error) done(error);
            else done();
        });
    });

});