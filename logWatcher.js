const events = require('events');
const fs = require('fs');

const bf = require('buffer');
const buffer = new Buffer.alloc(bf.constants.MAX_STRING_LENGTH);

const LINES = 10;
const OFFSET_FROM_END = -10;
const INTERVAL_IN_MILLISECONDS = 1000;

class LogWatcher extends events.EventEmitter {

    constructor(filename) {
        super();
        this.filename = filename;
        this.logs = [];
    }


    getLogs() {
        return this.logs;
    }


    watch(current, previous) {
        const watcher = this;
        
        fs.open(this.filename, (err, fd) => {
            if (err){
                throw err;
            }
            console.log("File opened successfully.");

            let fileData = '';
            let fileLogs = [];

            fs.read(fd, buffer, 0, buffer.length, previous.size, 
                (err, bytesRead) => {
                if (err) {
                    console.log(err);
                    throw(err);
                }

                if (bytesRead > 0) {
                    fileData = buffer.slice(0, bytesRead).toString()
                    fileLogs = fileData.split('\n');

                    if (fileLogs >= LINES) {
                        fileLogs.slice(OFFSET_FROM_END).forEach(ele => {
                            console.log(ele);
                            this.logs.push(ele);
                        })
                    } else {
                        fileLogs.forEach(ele => {
                            if (ele != '\r') {
                                if (this.logs.length == LINES) {
                                    console.log('Memory is Full');
                                    this.logs.shift();
                                }
                                console.log(ele);
                                this.logs.push(ele);
                            }                            
                        })
                    }
                    watcher.emit('process', fileLogs);
                }
            })
        })
    }


    start() {
        var watcher = this;

        fs.open(this.filename, (err, fd) => {
            if (err){
                throw err;
            }
            console.log("File opened successfully.");

            let fileData = '';
            let fileLogs = [];

            fs.read(fd, buffer, 0, buffer.length, 0, 
                (err, bytesRead) => {

                if (err) {
                    console.log(err);
                    throw(err);
                }

                if (bytesRead > 0) {
                    fileData = buffer.slice(0, bytesRead).toString();
                    fileLogs = fileData.split('\n');

                    fileLogs.slice(OFFSET_FROM_END).forEach(ele => {
                        console.log(ele);
                        this.logs.push(ele);
                    })
                }

                fs.close(fd, err => {
                    if (err) {
                       console.log(err);
                    } 
                    console.log("File closed successfully.");
                });
            });

            fs.watchFile(this.filename, 
                {'interval': INTERVAL_IN_MILLISECONDS}, 
                (current, previous) => {
                    watcher.watch(current, previous);
            })
        })
    }
}

module.exports = LogWatcher;