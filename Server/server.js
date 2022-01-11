const express = require('express')
const app = express()
const room = require('./room')
const port = 3000

  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })

  app.use(express.static('public'));
  app.use('/', room);
  app.use('/?', express.static('public/index.html'));

  var WebSocketServer = require('websocket').server;
  var http = require('http');
  
  var server = http.createServer(function(request, response) {
      console.log((new Date()) + ' Received request for ' + request.url);
      response.writeHead(404);
      response.end();
  });
  server.listen(8080, function() {
      console.log((new Date()) + ' Server is listening on port 8080');
  });
  
  wsServer = new WebSocketServer({
      httpServer: server,
      // You should not use autoAcceptConnections for production
      // applications, as it defeats all standard cross-origin protection
      // facilities built into the protocol and the browser.  You should
      // *always* verify the connection's origin and decide whether or not
      // to accept it.
      autoAcceptConnections: false
  });
  
  function originIsAllowed(origin) {
    // put logic here to detect whether the specified origin is allowed.
    return true;
  }

  function messageAllUTF(message){
      connections.forEach(function(connection){
        connection.sendUTF(message);
      })
  }

  function messageAllBytes(message){
    //console.log(message)
    connections.forEach(function(connection){
      connection.sendBytes(message);
    })
}

function removeConnection(connection){
  //console.log("Removing connection: ",connection.remoteAddress);
  connections.splice(connections.findIndex(e => e == connection));
}


function handleRoom(id, connection){
  if(!(id in rooms.roomlist)){
    console.log("Creating room: ",id)
    rooms.createroom(id);
  }
  if(rooms.roomlist[id].connections.findIndex(e=>e==connection)==-1){
    rooms.roomlist[id].addConnection(connection);
  }
}

  var messages = {
    msgQ: [],
    addMsgGroup: function(msg){
      this.msgQ.push(msg)
    }
  }

  var connections = []

  var rooms = {
    roomlist: {},
    createroom: function(id){
      this.roomlist[id] = {
        connections: [],
        addConnection: function (connection){
          this.connections.push(connection);
        },
        messageroom: function(message){
              this.connections.forEach(function(e){
                e.sendBytes(message)
              })
            }
          }
    },
    closeroom: function (id){
      delete this.roomlist[id]
    }
  }
  
  wsServer.on('request', function(request) {
      if (!originIsAllowed(request.origin)) {
        // Make sure we only accept requests from an allowed origin
        request.reject();
        console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
        return;
      }
      
      var connection = request.accept('echo-protocol', request.origin);
      connections.push(connection);
      console.log((new Date()) + ' Connection accepted.');
      connection.on('message', function(message) {

          if (message.type === 'utf8'){
              console.log('Received Message: ' + message);
              //connection.sendUTF(message.utf8Data);
              messageAllUTF(message.utf8Data);
          }
          else if (message.type === 'binary'){

              var buffer = Buffer.from(message.binaryData, 'hexadecimal').toString('utf8');
              let msg = (JSON.parse(buffer))
              
              switch(msg.target.type){
                case "all":
                  messageAllBytes(message.binaryData);
                  break;
                case "room":
                  handleRoom(msg.target.id, connection);
                  //connection.sendBytes()
                  break;
                case "roomMsg":
                  //roomMsg(msg.target.id, message.binaryData);
                  rooms.roomlist[msg.target.id].messageroom(message.binaryData)
                  break;
        }
      }
      });
      connection.on('close', function(reasonCode, description) {
          console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
          removeConnection(connection);
      });
  });