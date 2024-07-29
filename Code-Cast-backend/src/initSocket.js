const manageRoom = require('./Routes/socketCodeRouter');


const initSocketIO = (io, connection) => {

    //connection is object which contains the count of participants and array of user's socket id, 
    io.on('connection', (socket) => {
        ++connection.count;
        connection.users.push(socket.id);
        console.log(`A user connected. Total connections: ${connection.count}`);

        manageRoom(socket, io);

        socket.on('disconnect', () => {
            connection.count--;
            connection.users = connection.users.filter((user) => user !== socket.id);
            console.log(`A user disconnected. Total connections: ${connection.count}`);

        });
    });

};

module.exports = initSocketIO;
