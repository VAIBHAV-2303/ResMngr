/*
Main webapp file importing all
the routing functions and initializing the app
and the db
*/

// Setting environment variables
const dotenv = require('dotenv');
dotenv.config();

const constants = require("../utils/constants").constants;

// getting db reference
var DBClass = require("../database/database");
var db = new DBClass();

// Declaring the express app
const express = require('express')
const app = express();

// Configuring encodings
const bodyParser = require('body-parser')
var rawBodySaver = function (req, res, buf, encoding) { // Raw request body required for req verification 
  if (buf && buf.length) {
    req.rawBody = buf.toString(encoding || 'utf8');
  }
}
app.use(bodyParser.json({ verify: rawBodySaver }));
app.use(bodyParser.urlencoded({ verify: rawBodySaver, extended: true }));

// Start listening
const PORT = process.env.PORT
app.listen(PORT, () =>
  console.log(`${constants["APP_NAME"]} app started and listening on port ${PORT}!`),
);

const debugLogger = require("../utils/debugLogger").debugLogger;

var resourceMutexMap = {};

// Logging debug mode status
debugLogger("========DEBUG MODE==========");

// Loading core route functions
app.get('/', (req,res) => {
  return res.send("I am awake");
});

require('./hello')(app);

require('./add')(app, db);

require('./remove')(app, db);

require('./list')(app, db);

require('./lock')(app, db, resourceMutexMap);

require('./release')(app, db);

require('./interaction')(app, db, resourceMutexMap);

require("./addChannel")(app, db);

require("./removeChannel")(app, db);

require("./distribute")(app, db);



// Routine to remove unlocked mutexes
setInterval(function(resourceMutexMap) {

  for(var key in resourceMutexMap) {
    if(!resourceMutexMap[key].isLocked()) {
      debugLogger("Released transaction lock for ", key);
      delete resourceMutexMap[key];
    }
  }

}, 1000*60*60);