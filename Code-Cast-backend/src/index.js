const express = require('express');
const DBConnect = require('./DB/connect');
const userRouter = require('./Routes/userRoutes')
const roomRouter = require('./Routes/roomRoutes')
const codeRouter = require('./Routes/codeRoutes');
const { createServer } = require("http");
const { Server } = require("socket.io")
//Server (from socket.io): Enables real-time bidirectional event-based communication.
const cors = require('cors');
const initSocketIO = require('./initSocket');
require('dotenv').config();

const port = process.env.PORT || 8080;
const bodyParser = require('body-parser');
const axios = require('axios')

const app = express();
const httpServer = createServer(app);

app.use(bodyParser.json({ limit: '1mb' }));


//Creating a new Socket.IO server with CORS settings.
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        transports: ['websocket', 'polling'], credentials: true
    }, allowEIO3: true
});

//Below is an object to track connection details.
const connection = {
    count: 0,
    users: []
}
initSocketIO(io, connection)
//Initializes Socket.IO with the connection object.


app.use(cors());
app.use(express.json());
app.use(userRouter);
app.use(roomRouter);
app.use(codeRouter)


/* 
   setInterval: Makes a GET request to BASE_URL every 300,000 milliseconds (5 minutes) 
   to keep the application alive or for some monitoring purpose.
*/

//?
setInterval(() => {
    axios.get(process.env.BASE_URL)
        .then((res) => {
            console.log(res.data);
        })
        .catch((err) => {
            console.log(err);
        })
}, 300000);

DBConnect().then(() => {
    console.log("DB connected");
    httpServer.listen(port, () => {
        console.log('Server started on port: ' + port);
    })
}); 

app.use('/', (req, res) => {
    res.status(200).send(connection)
})



/* 
Axios - It is used to make HTTP requests (GET, POST, PUT, DELETE, etc.) from the client-side or server-side applications

Automatically transforms JSON data.

why axios is better than fetch - 
Fetch: Requires manual parsing of JSON responses using response.json().
axios is easy to use
*/