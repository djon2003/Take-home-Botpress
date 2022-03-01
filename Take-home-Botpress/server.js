'use strict';
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const fs = require('fs');
const folders = process.argv.slice(2);
const port = process.env.PORT || 1337;
const hound = require('hound');

// Respond to HTTP requests
app.get("/", (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get("/client.*", (req, res) => {
    var fileName = req.url.substring(req.url.lastIndexOf("/") + 1);
    res.sendFile(__dirname + '/resources/' + fileName);
    console.log("Sending for request: " + __dirname + '/resources/' + fileName);
});

// Initial folders loading or subfolder loading
io.on('connection', (socket) => {
    socket.on('load', (data) => {
        var entries = [];
        if (data == "") {
            folders.forEach(folder => {
                entries = entries.concat(listFolder(folder));
            });
        } else {
            entries = entries.concat(listFolder(data));
        }

        io.sockets.emit('load', { entries: entries });

        function listFolder(folder) {
            var entries = [];
            console.log("Loading folder " + folder);
            fs.readdirSync(folder).forEach(entryName => {
                entries.push({
                    type: "add",
                    container: folder,
                    name: entryName,
                    isDirectory: fs.statSync(folder + "/" + entryName).isDirectory()
                });
            });
            return entries;
        }
    });
});

// Emit a change detected
function emitEntryChange(type, entryPath) {
    entryPath = entryPath.replaceAll("\\", "/");
    var lastSeparatorIndex = entryPath.lastIndexOf('/');
    var entryContainer = entryPath.substring(0, lastSeparatorIndex);
    var entryName = entryPath.substring(lastSeparatorIndex + 1);

    io.sockets.emit('change', {
        type: type,
        container: entryContainer,
        name: entryName,
        isDirectory: (type != "delete" ? fs.statSync(entryPath).isDirectory() : null)
    });
}
// Watch subscriptions
folders.forEach(folder => {
    // Create a directory tree watcher.
    var watcher = hound.watch(folder);
    // Add callbacks for file and directory events.
    watcher.on('create', function (entryPath, stats) {
        emitEntryChange('add', entryPath);
        console.log(entryPath + ' was created');
    });
    watcher.on('change', function (entryPath, stats) {
        emitEntryChange('change', entryPath);
        console.log(entryPath + ' was changed');
    });
    watcher.on('delete', function (entryPath) {
        emitEntryChange('delete', entryPath);
        console.log(entryPath + ' was deleted');
    });

    console.log("Watching folder " + folder);
});


// Start server
server.listen(port, () => {
    console.log("Listening on port " + port);
});