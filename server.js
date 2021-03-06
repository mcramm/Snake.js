var sys = require("util")
  , ws = require('./node-websocket-server/lib/ws/server');

var Game = require('./game').Game

var game = new Game();

var server = ws.createServer({debug: false});


// Handle WebSocket Requests
server.addListener("connection", function(conn){
  conn.send(JSON.stringify({command:'id', value:conn.id, field: {x:100, y:100}}));

  conn.addListener("message", function(msg){
       try{
          var data = JSON.parse(msg);
          if (data.command === 'action') {
              game.responses[conn.id] = data.value;
          }
          if (data.command === 'username') {
              game.addPlayer(conn, data.value);
          }
       } catch(e) {
           console.warn(e + 'dropping command for ' + conn.id + ' command: ' + msg);
       }
  });
});

server.addListener("error", function(){
  console.log(Array.prototype.join.call(arguments, ", "));
});

server.addListener("disconnect", function(conn){
  console.log('disconnect');
  game.removePlayer(conn);
});

// game cycle
server.listen(8000, function() {
    console.log("Server Started");
    setInterval(function() {
        server.broadcast(JSON.stringify(
            game.tick()
        ));
    }, 1000/game.fps);
});

