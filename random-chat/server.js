const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static('public'));

let onlineUsers = [];

io.on('connection', (socket) => {
  socket.on('user-info', (userInfo) => {
    socket.userInfo = userInfo;
    onlineUsers.push(socket);

    socket.on('start-search', () => {
      const otherUser = onlineUsers.find(
        (s) => s !== socket && !s.paired && !socket.paired
      );
      if (otherUser) {
        socket.paired = true;
        otherUser.paired = true;

        socket.partner = otherUser.id;
        otherUser.partner = socket.id;

        socket.emit('paired', otherUser.userInfo);
        otherUser.emit('paired', socket.userInfo);
      }
    });

    socket.on('message', (msg) => {
      const partnerSocket = onlineUsers.find((s) => s.id === socket.partner);
      if (partnerSocket) {
        partnerSocket.emit('message', {
          from: socket.userInfo.name,
          msg: msg
        });
      }
    });

    socket.on('disconnect', () => {
      onlineUsers = onlineUsers.filter((s) => s !== socket);
      if (socket.partner) {
        const partnerSocket = onlineUsers.find((s) => s.id === socket.partner);
        if (partnerSocket) {
          partnerSocket.paired = false;
          partnerSocket.partner = null;
          partnerSocket.emit('partner-disconnected');
        }
      }
    });
    let waitingUsers = [];

io.on("connection", (socket) => {
  socket.on("findPartner", () => {
    if (waitingUsers.length > 0) {
      const partnerSocket = waitingUsers.pop();
      socket.partner = partnerSocket;
      partnerSocket.partner = socket;

      socket.emit("partnerFound");
      partnerSocket.emit("partnerFound");
    } else {
      waitingUsers.push(socket);
    }
  });

  socket.on("disconnect", () => {
    waitingUsers = waitingUsers.filter(s => s !== socket);
  });
});

  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

http.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
