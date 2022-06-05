const express = require('express');
const path = require('path');
const app = express();
const PORT = 8080;
const http = require('http').Server(app);
const socketIO = require('socket.io');
const io = socketIO(http);
const HTML_FILENAME = 'index.html';

const FILENAME = 'test.log';
const LogWatcher = require('./logWatcher');
let logWatcher = new LogWatcher(FILENAME);
logWatcher.start();

app.get('/log', (request, response) => {
    console.log('Request Recieved');

    var options = {
        root: path.join(__dirname)
    }

    response.sendFile(HTML_FILENAME, options, err => {
        if (err) {
            next(err);
        } else {
            console.log('Sent:', HTML_FILENAME);
        }
    });
})

io.on('connection', socket => {
    console.log(`Connection Established ${socket.id}`);

    logWatcher.on('process', data => {
        socket.emit('update-log', data);
    }) 
    let data = logWatcher.getLogs();
    socket.emit('init', data);
});


http.listen(PORT, () => {
    console.log(`Listening to http://localhost:${PORT}`)
});