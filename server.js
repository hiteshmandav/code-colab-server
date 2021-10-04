const express = require('express');
const cors = require('cors');

const app = express();

const http = require('http').createServer(app);

const socket = require('socket.io')(http, {
    cors : {
        origin : '*'
    }
});



app.get('/', (req, res) => {
    res.send('Hello server is running ')
});


socket.on('connection', (connectedSocket) => {
    console.log(`connection established : ${connectedSocket.id}
                Params recived :: ${connectedSocket.handshake.query.roomName} 
                :: ${connectedSocket.handshake.query.tagName}`);
    let roomName = connectedSocket.handshake.query.roomName;
    let tagName = connectedSocket.handshake.query.tagName;
    connectedSocket.on('send-message', message => {
        console.log(`Message Recived ${message}`);
        connectedSocket.to(roomName).emit('recive-message', ({'message' : message, 'tag': tagName}));
    });

    connectedSocket.on('join-room', () => {
        connectedSocket.join(roomName);
        connectedSocket.to(roomName).emit('room-joined', tagName);
    });
});

http.listen(3000, () => {
    console.log('code colab server is running');
});