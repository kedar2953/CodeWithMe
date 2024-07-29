const { createRoom, addRoomUser, removeRoomUser, getRoom, updateRoomCode, updateCodeEditorCredentials, deleteUser, updateUserSocketMap, userSocketMap } = require('../Room/socketRoom');

function manageRoom(socket, io) {

    const { id: socketId } = socket;
    //socket.on("event name")
    socket.on('join', async ({ roomName = 'Room X', roomid, name, code = '', language = 'javascript', input = '', output = '', avatar = '' }) => {
        try {
            if (!name) {
                throw new Error('Invalid data');
            }
            createRoom(roomid, roomName, code, language, input, output);

            addRoomUser(roomid, { id: socketId, name, avatar });

            await socket.join(roomid);


            
            socket.emit('join', { msg: `Welcome to ${roomName}`, room: getRoom(roomid), socketId });

            //telling other that i haved joined
            socket.to(roomid).emit('userJoin', { msg: `New user joined ${name}`, newUser: { id: socketId, name, avatar } });
        } catch (err) {
            console.log(err);
            socket.emit('error', { error: err });
        }
    });

    //reflecting one's changes to other
    socket.on('update', ({ roomid, patch }) => {
        try {
            updateRoomCode(roomid, patch);

            //broadcasting the update to others that i have updated something, to reflect changes to other
            socket.to(roomid).emit('update', { patch });
        } catch (err) {
            console.log(err);
            socket.emit('error', { error: err });
        }
    });

    socket.on('leave', ({ roomid }) => {
        try {
            const name = removeRoomUser(roomid, socketId);
            socket.leave(roomid);
            
            io.to(roomid).emit('userLeft', { msg: `${name} left the room`, userId: socketId });
            console.log('user left', name);
            socket.to(roomid).emit('user left video call', { msg: `${name} left the room`, userID: socketId });
        } catch (err) {
            console.log(err);
            socket.emit('error', { error: err });
        }
    });


    //if we update the credentials of code editor like theme, language
    socket.on('updateIO', ({ roomid, input, output, language }) => {
        try {
            updateCodeEditorCredentials(roomid, input, output, language);
            socket.to(roomid).emit('updateIO', {
                newinput: input,
                newoutput: output,
                newlanguage: language
            });
        } catch (err) {
            console.log(err);
            socket.emit('error', { error: err });
        }
    })

    socket.on('getRoom', ({ roomid }) => {
        try {

            //to get roomid of current room,
            io.in(roomid).emit('getRoom', { room: getRoom(roomid) });
        } catch (err) {
            console.log(err);
            socket.emit('error', { error: err });
        }
    })

    //we are leaving from app not from room, here we are deleting the user's socketid and related info
    //we are also deleting the use 
    socket.on('disconnect', () => {
        for (let [key, value] of userSocketMap.entries()) {
            if (value === socketId) {
                userSocketMap.delete(key);
                break;
            }
        }

        //removing the user from all rooms to which he was joined
        let roomid = deleteUser(socketId);
        if (roomid !== null) {
            const name = removeRoomUser(roomid, socketId);
            socket.leave(roomid);
            io.to(roomid).emit('userLeft', { msg: `${name} left the room`, userId: socketId });
            console.log('user left', name);
            socket.to(roomid).emit('user left video call', { msg: `${name} left the room`, userID: socketId });
        }
    });


    //whiteboard
    socket.on("drawData", (data) => {
        socket.to(data.roomId).emit("drawData", data);
    });

    
    socket.on("start-video", ({ roomID }) => {
        let allUsers = getRoom(roomID).users;
        allUsers = allUsers.filter(user => user.id !== socketId);
        socket.emit('allUsers', allUsers);
    });

    socket.on("sending video signal", (data) => {
        socket.to(data.userToSignal).emit("new video user joined", { signal: data.signal, callerID: data.callerID, userSending: data.userSending });
    });

    socket.on("returning video signal from receiver", (data) => {
        socket.to(data.callerID).emit("sender receiving final signal", { signal: data.signal, id: socketId });
    });

    socket.on("toggle-video", (data) => {
        socket.broadcast.to(data.roomID).emit("toggle-video", { userID: data.userID });
    })

    socket.on("toggle-audio", (data) => {
        socket.broadcast.to(data.roomID).emit("toggle-audio", { userID: data.userID });
    })


    //mapping the userid with socketid whenever user will join the app 
    socket.on("map socket", ({ userID }) => {
        userSocketMap.set(userID, socketId);
    })

    //
    socket.on("join permission", ({ room, user }) => {

        //getting socket id of owner of room
        let owner = userSocketMap.get(room.owner);
        console.log(socketId);
        //checking the code that user entered to join the code and then letting the user join the room
        io.to(owner).emit("join permission", { room, user, senderID: socketId });
    })


    socket.on("accept permission", ({ senderID }) => {
        //alerting sender about joined accpted
        io.to(senderID).emit("permission accepted")
    })

    socket.on("reject permission", ({ senderID }) => {
        io.to(senderID).emit("permission rejected")
    })

}

module.exports = manageRoom;
