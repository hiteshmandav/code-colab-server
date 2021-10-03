const express = require('express');
const cors = require('cors');

const app = express();

const http = require('http').createServer(app);

const socket = require('socket.io')(http, {
    cors : {
        origin : '*'
    }
});

http.listen(3000, () => {
    console.log('code colab server is running');
});