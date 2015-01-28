var http = require('http');
var path = require('path');
var express = require('express');

// Create and configure Express web app
var app = express();
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));

// Mount server-handled routes
require('./server')(app);

// Create HTTP server
var server = http.createServer(app);
var port = process.env.PORT || 3000;
server.listen(port, function() {
    console.log('Express server listening on *:' + port);
});

