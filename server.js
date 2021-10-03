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
    console.log(`connection established : ${connectedSocket.id}`);
    connectedSocket.on('send-message', message => {
        console.log(`Message Recived ${message}`);
        connectedSocket.broadcast.emit('recive-message', message);
    });
});

http.listen(3000, () => {
    console.log('code colab server is running');
});