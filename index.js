const app = require('express')();
const express = require('express');
const http = require('http').Server(app);
const io = require('socket.io')(http);

// let io = require('socket.io')(http, {
//   serveClient: true,
//   // below are engine.IO options
//   pingInterval: 3000,
//   pingTimeout: 10000,
//   cookie: false
// });

process.on('uncaughtException', function (err) {
  console.error('uncaughtException', err.stack);

});

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
app.use(express.static(__dirname + '/public'));

let userList = { users: [] };

io.on('connection', function (socket) {
  console.log('HEJ');
  let userName = '';
  sendUserList(userList);
  socket.on('change_username', function (data) {
    {
      userName = data.username;
      socket.username = userName;
      userList.users.push(userName);
      sendUserList(userList);
      io.emit('chat message', socket.username + ' connected');
      console.log(socket.username + ' connected');
    }
  });
  socket.on('sendPing', function (userName) {
    let d = new Date();
    console.log(d + userName + ' pinged');
  });
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });
  socket.on('done typing', function () {
    socket.broadcast.emit('done typing', {
      username: socket.username
    });
  });
  socket.on('disconnect', function () {
    let index = userList.users.indexOf(userName);
    if (index > -1) {
      userList.users.splice(index, 1);
    }
    sendUserList(userList);
    console.log(socket.username + ' user disconnected');
    socket.username = '';
  });

  socket.on('chat message', function (msg) {
    console.log(socket.username + ': ' + msg);
    io.emit('chat message', socket.username + ': ' + msg);
  });
});

http.listen(8000, function () {
  console.log('listening on *:8000');
});

function sendUserList(userList) {
  io.emit('userList', userList);
}
