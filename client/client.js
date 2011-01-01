client = function(canvas) {
    var ctx = null;
    var serverName = "localhost:8000";
    var userName = "something";

    this.food_timeout = 1; // minutes
    this.food_width = 3;

    this.snake_width = 3;

    var init = function() {
        ctx = canvas.getContext("2d");
    };


    var count = 0;
    var debug = function() {
        if( count < 20 ){
            count += 1;
            console.debug(arguments);
        }
    }
    var drawSnake = function(snake) {
        if( snake.color != "" ) {
            ctx.fillStyle = snake.color;
        }
        ctx.fillRect(snake.head.x,snake.head.y,snake_width,snake_width);

        for(var i in snake.body) {
            var part = snake.body[i];
            ctx.fillRect( part.x, part.y, snake_width, snake_width);
        }

        ctx.fillStyle = "#000000";
    };
    
    var drawFood = function(food) {
        ctx.fillStyle = "#00A308";
        ctx.fillRect( food.x, food.y, food_width, food_width );
        ctx.fillStyle = "#000000";
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
            updateScores(snake);
        };

        drawFood(state.food);
    };


    var getServerName = function() {
        return serverName;
    };
    
    var getUserName = function() {
        return userName;
    };

    var updateScores = function(snake) {
        var playerNode = $('#' + snake.id);
        console.log(playerNode.length);
        if( playerNode.length == 0 ){
            $('#players-wrap').append("<div id='" + snake.id + "' class='player'>" +
                "<span id='name' class='name'>" + snake.username + " - </span>" +
                "<span class='label'>score:</span><span id='score' class='score'>" + snake.score + "</span>" +
                "<span class='label'>kills:</span><span id='kills' class='kills'>" + snake.kills + "</span>" +
                "<span class='label'>length:</span><span id='length' class='length'>" + snake.max_length + "</span>" +
                "<span class='label'></span><span id='color' class='color' style='background-color: " + snake.color + "'></span>" +
            "</div>");
        } else {
            if( !snake.alive ) {
                return;
            }
            console.log(playerNode.children());
            playerNode.children("#score").html( snake.score );
            playerNode.children("#kills").html( snake.kills );
            playerNode.children("#length").html( snake.max_length );
        }
    };

    init();

    return {
        refresh: refreshScreen,
        getServerName: getServerName,
        getUsername: getUserName
    };
};
