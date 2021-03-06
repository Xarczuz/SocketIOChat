$(document).ready(function () {
  let userName = prompt('Username', 'AnonymousX');
  if (userName == null || userName == '') { alert('User canceled'); } else {
    connect(userName);
  }
});

function connect(userName) {
  const socket = io('http://localhost:3000');
  let message = $('#m');
  socket.emit('change_username', {
    username: userName
  });

  // setInterval(function () {
  //   socket.emit('sendPing', userName);
  // }, 5000);

  message.bind('keypress', function () {
    socket.emit('typing');
  });
  socket.on('typing', function (data) {
    $('#feedBack').html($('<li>').text(data.username + ' is typing'));
    $('#chat').scrollTop($('#messages').height());
  });
  socket.on('done typing', function (data) {
    $('#feedBack').html($('<li>').text());
  });
  $('form').submit(function () {
    socket.emit('done typing');
    socket.emit('chat message', $('#m').val());
    $('#m').val('');
    return false;
  });
  socket.on('chat message', function (msg) {
    $('#messages').append($('<li>').text(msg));

    $('#chat').scrollTop($('#messages').height());

  });

  socket.on('userList', function (user) {
    $('#users').html('');
    for (let i = 0; i < user.users.length; i++) {
      $('#users').append($('<li>').text(user.users[i]));
    }
  });
}