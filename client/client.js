client = function(canvas) {
    var ctx = null;
    var curPlayerId = null;
    var serverName = "localhost:8000";
    var userName = "something";

    var init = function() {
        ctx = canvas.getContext("2d");
    };


    var drawSnake = function(snake) {
        if( snake.color != "" ) {
            ctx.fillStyle = snake.color;
        }
        ctx.fillRect(snake.x,snake.y,3,3);

        for(var i in snake.body) {
            var part = snake.body[i];
            ctx.fillRect( part.x, part.y, 3, 3);
        }

        ctx.fillStyle = "#000000";
    };
    
    var drawFood =function(food) {
        ctx.fillRect( food.x, food.y, 3, 3 );
    };

    var refreshScreen = function(state) {
        if (!state) {
            return;
        }

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.strokeRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        for (var i in state.players) {
            var snake = state.players[i];

            drawSnake(snake);
        };
        drawFood(state.food);
    };

    var setCurrentPlayerId = function(id) {
        curPlayerId = id;
    };

    var getServerName = function() {
        return serverName;
    };
    
    var getUserName = function() {
        return userName;
    };

    init();

    return {
        refresh: refreshScreen,
        getServerName: getServerName,
        getUsername: getUserName,
        setCurrentPlayerId: setCurrentPlayerId
    };
};
