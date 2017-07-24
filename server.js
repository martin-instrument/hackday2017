// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

var socketHeartbeats = {};

io.on('connection', function (socket) {
  var addedUser = false;

  let timing = 0;

  console.log("Client connected");

  socket.on('buttonUpdate', function (data) {
    console.log(data);
    io.emit('buttonUpdate', data);
  });

  socket.on('connect', function (data) {
    socketHeartbeats[data.id] = (new Date()).getTime();
    console.log(data);
    io.emit('connected', data);
  });

  socket.on('heartbeat', function (data) {
    // socketHeartbeats[data.id] = (new Date()).getTime();
    const now = (new Date()).getTime();
    io.emit('heartbeat', data);
    console.log("heartbeat");
    console.log(data);
    timing = now;
  });
});