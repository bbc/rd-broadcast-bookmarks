// Simple TV schedule REST API

// Set up express application
var express = require('express');
var app = express();
var utils = require('./lib/utils');
var cors  = require('./lib/cors');
var config = require('./config/config');
var db = require("./lib/db");

db.channels = utils.read_json('./data/channels.json');
db.schedule = utils.read_json('./data/schedule.json');
db.bookmarks = {
    "jsmith" : {} // dummy user
};

// Serve static files from public
app.use(express.static(__dirname + '/public'));

// Add Cross Origin Resource Sharing (CORS) headers
// to all requests
app.configure(function() {
    app.use(cors.allowCrossDomain);
});

// Serve API documentation
app.get('/api', function (req, res) {
  res.sendfile('./docs/api.html');
});

// Serve task information
app.get('/task', function (req, res) {
  res.sendfile('./docs/task.html');
});

// API: GET /channels
app.get('/channels', function(req, res) {
          res.send(db.channels);
});

// API: GET /channels/:channel_id
app.get('/channels/:channel_id', function(req, res) {
          var channel_id = req.params.channel_id;
          if(channel_id in db.channels) {
            res.send(db.channels[channel_id]);
          } else {
            res.send(404);
          }
});

// API: GET /schedule/:channel_id/:date
app.get('/schedule/:channel_id/:date', function(req, res) {
          var channel_id = req.params.channel_id;
          var start_date = req.params.date;
          var end_date = start_date;
          var result = utils.get_schedule(channel_id, start_date, end_date);
          if(result) {
            res.send(result);
          } else {
            res.send(404);
          }
});

// API: GET /schedule/:channel_id/:start_date/:end_date
app.get('/schedule/:channel_id/:start_date/:end_date', function(req, res) {
          var channel_id = req.params.channel_id;
          var start_date = req.params.start_date;
          var end_date = req.params.end_date;
          var result = utils.get_schedule(channel_id, start_date, end_date);
          if(result) {
            res.send(result);
          } else {
            res.send(404);
          }
});

// API: GET /bookmarks/:user
app.get('/bookmarks/:user_id', function(req, res) {
          var user_id = req.params.user_id;
          var result = utils.get_bookmarks(user_id);
          if(result) {
            res.send(result);
          } else {
            res.send(404);
          }
});

// API: GET /bookmarks/:user/:pid
app.get('/bookmarks/:user_id/:pid', function(req, res) {
          var user_id = req.params.user_id;
          var pid = req.params.pid;
          var result = utils.get_bookmark(user_id, pid);
          if(result) {
            res.send(result);
          } else {
            res.send(404);
          }
});

function create_bookmark(req, res) {
          var user_id = req.params.user_id;
          var pid = req.params.pid;
          var result = utils.put_bookmark(user_id, pid);
          if(result) {
            res.send(result, 201); // 201 Created
          } else {
            res.send(400);         // 400 Bad request
          }
}

// API: PUT /bookmarks/:user/:pid
app.put('/bookmarks/:user_id/:pid', create_bookmark);

// API: POST /bookmarks/:user/:pid
app.post('/bookmarks/:user_id/:pid', create_bookmark);

// API: DELETE /bookmarks/:user/:pid
app.del('/bookmarks/:user_id/:pid', function(req, res) {
          var user_id = req.params.user_id;
          var pid = req.params.pid;
          var result = utils.delete_bookmark(user_id, pid);
          if(result) {
            res.send(result);
          } else {
            res.send(404);
          }
});

// API: GET /broadcasts/:pid
app.get('/broadcasts/:pid', function(req, res) {
          var pid = req.params.pid;
          var result = utils.get_broadcast(pid);
          if(result) {
            res.send(result);
          } else {
            res.send(404);
          }
});


// DEBUG only
// GET /bookmarks
app.get('/bookmarks', function(req, res) {
    res.send(db.bookmarks);
});

// Run app on port
app.listen(config.PORT);
console.log('Listening on port ' + config.PORT + '...');
