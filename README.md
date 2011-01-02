Snakes.js
==========

This is a simple multiplayer game of Snakes (or [nibbles](http://en.wikipedia.org/wiki/Nibbles_\(video_game\)), or whatever else it might be called). It operates through [Node.js](http://nodejs.org/) and [miksago's](https://github.com/miksago) awesome [node-websocket-server](https://github.com/miksago/node-websocket-server) project.

Installing
----------

First, [install Node.js](http://nodejs.org/#build)

Next, clone this repo:
    git clone https://github.com/mcrmm/Snake.js.git snakes

Now clone the node-websocket-server project into this directory:
    cd snakes
    git clone https://github.com/miksago/node-websocket-server.git

Next, start the server using:
    node server.js


Finally, open the index.html file located in the "client" subfolder. 


Playing
-------

Once you have access to the web page, you will be prompted to enter a username, then hit play (note that you can just watch if you want).

You can move your snake using the arrow keys on your keyboard. Eat food (small green squares) to grow longer, and increase your score.

The game supports up to 8 players, and the server will restart automatically if the limit is reached.
