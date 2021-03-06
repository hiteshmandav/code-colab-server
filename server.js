var PORT = process.env.PORT || 3000;
const express = require('express');
const cors = require('cors');

const app = express();

const http = require('http').createServer(app);

const socket = require('socket.io')(http, {
    cors : {
        origin : '*'
    }
});

let users = [];

const addUser =  (tag, room, id) => {
    users.push({
        tagName : tag,
        roomName : room,
        id: id,
        stream: null
    });

    // console.log(`user added :: ${tag} :: room :: ${room}`)
}

const removeUserFromRoom =  (id) => {
    users = users.filter(user => (user.id != id));
    // console.log(`user removed :: ${id}`)
}

const getAllUsersFromRoom =  (room) => {
    let roomUsers = users.filter(user => (user.roomName == room));
    // console.log(`users in Room:: ${room} are :: ${roomUsers}`)
    return roomUsers;
}


app.get('/', (req, res) => {
    res.send('Hello server is running ')
});


socket.on('connection', (connectedSocket) => {
    // console.log(`connection established : ${connectedSocket.id}
    //             Params recived :: ${connectedSocket.handshake.query.roomName} 
    //             :: ${connectedSocket.handshake.query.tagName}`);
    let roomName = connectedSocket.handshake.query.roomName;
    let tagName = connectedSocket.handshake.query.tagName;

    connectedSocket.on('send-message', message => {
        // console.log(`Message Recived ${message}`);
        connectedSocket.to(roomName).emit('recive-message', ({'message' : message, 'tag': tagName}));
    });

    connectedSocket.on('video', (userVideoDetails) => {
        // let returnNum = parseInt(num) + 1
        let users = getAllUsersFromRoom(roomName).map(x => {
            if(x.id == userVideoDetails.id ) {
                console.log('stream changed')
                x.stream = userVideoDetails.stream;
                return x;
            }
            return x;
        });
        console.log(users)
        connectedSocket.to(roomName).emit('recive-video', users);
    });

    connectedSocket.on('join-room', () => {
        connectedSocket.join(roomName);
        addUser(tagName, roomName, connectedSocket.id);
        connectedSocket.to(roomName).emit('room-joined', tagName);
        socket.to(roomName).emit('all-users', getAllUsersFromRoom(roomName));
    });

    connectedSocket.on('disconnect', () => {
        removeUserFromRoom(connectedSocket.id);
        socket.to(roomName).emit('user-disconnected', tagName);
        socket.to(roomName).emit('all-users', getAllUsersFromRoom(roomName));
    });

    connectedSocket.on('send-private-msg', (privateMessageDetails, callbackFn) => {
        // removeUserFromRoom(connectedSocket.id);
        socket.to(privateMessageDetails.id).emit('recive-private-message',(
                                                {
                                                    'message' : privateMessageDetails.message,
                                                    'tag': tagName,
                                                    'senderId' : connectedSocket.id
                                                }));
        let user = users.filter(user => user.id == privateMessageDetails.id)[0].tagName;
        callbackFn(`Private Message to ${user} was sent SuccessFully `);
    });

});

http.listen(PORT , () => {
    console.log('code colab server is running on Heroku Automatically');
});