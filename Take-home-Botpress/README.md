# Take-home-Botpress

This project represents a dynamic web file explorer.

## Usage

- node server.js "PATH/TO/FOLDER1" "PATH/TO/FOLDER2" "ETC"
- Launch a webbrowser to the URL: http://localhost:1337

## Explanations

- On server launch, it 
  - setups two possible handled requests: index.html or client.*. This serves the client all the needed files.
  - registers listening to web socket upon "load" message
  - starts watching folders passed as arguments

- On client launch, it
  - sends an initial "load" message via web socket
  - loads the initial tree upon receival of the "load" message response

- Within client, when clicking on a folder, it
  - sends a "load" message via web socket for this folder
  - loads the content of this folder upon receival of the "load" message response

- When one of the watched folder is modified (file renamed, deleted, added),
  - the server sends a "change" message
  - the client applies the "change" to the tree if the container of the file is currently loaded on the page