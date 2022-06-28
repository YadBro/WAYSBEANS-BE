const express       = require("express");
const router        = require("./src/routes/index");
const bodyParser    = require("body-parser");
const app           = express();
const cors          = require("cors");
app.use(cors());
require("dotenv").config();
const PORT      = process.env.PORT || 5000;

app.use(express.json());
app.use(bodyParser.json());

const http = require('http');
const server = http.createServer(app)
const {Server} = require('socket.io');

const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000' // define client origin if both client and server have different origin
    }
});
require('./src/socket')(io);
app.use("/uploads", express.static("uploads"));

app.use("/api/v1/", router);

app.get("/", (req, res) => {
    res.send('Hello World');
});


server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});