var GAME_OVER = false;
var PAUSED = false;

var Game = function() {
    this.responses = {};
    this.state = this.buildState();
    this.game = {};
    this.impassible = [];

    this.width = 600;
    this.height = 500;

    this.colors = ['black', 'red', 'blue', 'orange', 'magenta', 'cyan', 'yellow', 'brown'];
    this.fps = 50;

    this.food_timeout = 1; // minutes
    this.food_width = 3;

    this.snake_width = 3;

    this.no_generate_buffer = 10; // pixel buffer around edge of arena where no food can be generated
}

Game.prototype.buildState = function() {
    var newState = {players: {}, food: {}, player_count: 0};
    return newState;
}

Game.prototype.addPlayer = function(conn) {
    this.state.player_count += 1;
    if( this.state.player_count > 8 ) {
        console.log('Max number of players reached, need to restart server');
    }
    var x, y, direction;
    switch( this.state.player_count ) {
        case 5:
        case 1:
            x = 25; y = 25; direction = "E";
            break;
        case 6:
        case 2:
            x = 25; y = 475; direction = "N";
            break;
        case 7:
        case 3:
            x = 475; y = 475; direction = "W";
            break;
        case 8:
        case 4:
            x = 475; y = 25; direction = "S";
            break;
    }
    var snake = {
        x: x,
        y: y,
        direction: direction,
        max_length: 10,
        score: 0,
        color: this.colors[ this.state.player_count - 1 ],
        alive: true,
        kills: 0,
        body: []
    };

    this.state.players[conn.id] = snake;
    for(var i = 0; i < snake.max_length; i++){
        this.handleMove(conn.id, snake.direction);
    }
}

Game.prototype.checkDeadCount = function() {
    var dead_count = 0;
    var snake;
    for ( var i in this.state.players ){
        snake = this.state.players[i];
        if( !snake.alive ){
            dead_count += 1;
        } else {
            break;
        }
    }

    if( dead_count >= 4 ){
        this.reset();
    }
}
Game.prototype.reset = function() {
    this.responses = {};
    this.state = this.buildState();
    this.game = {};
}

Game.prototype.simulate = function(responses, old) {
    var state = JSON.parse(JSON.stringify(old));

    for ( var i in responses ){
        var direction = responses[i];
        var snake = state.players[i];
        if( snake.alive ) {
            if( direction ){
                this.handleMove(i, direction);
            }
        } 
    }

    for ( var i in this.state.players ) {
        var snake = state.players[i];

        if( !snake.alive ) {
            continue;
        }

        if( this.state.food !== null ){
            this.detectFood(i);
        }


        this.detectCollision(i);
    }



    if( this.state.food.x == null ) {
        this.generateFood();
    } else {
        this.tickFood();
    }

}

Game.prototype.detectFood = function(id) {
    var snake = this.state.players[id];
    if( (snake.x >= this.state.food.x && snake.x <= this.state.food.x+this.food_width ||
            snake.x + this.snake_width >= this.state.food.x && snake.x + this.snake_width <= this.state.food.x+this.food_width) &&
        (snake.y >= this.state.food.y && snake.y <= this.state.food.y+this.food_width ||
            snake.y + this.snake_width >= this.state.food.y && snake.y + this.snake_width <= this.state.food.y+this.food_width)) {
        snake.max_length += 20;
        snake.score += 20;

        this.state.food = {};
    }
}

Game.prototype.generateFood = function(id) {
    var randomX = Math.floor( Math.random()  * this.width - (this.no_generate_buffer * 2)) + this.no_generate_buffer;
    var randomY = Math.floor( Math.random()  * this.height - (this.no_generate_buffer * 2)) + this.no_generate_buffer;

    this.state.food = { 
        x: randomX,
        y: randomY,
        timeout: (this.food_timeout * 60 * 1000)
    };
}

Game.prototype.detectCollision = function(id){
    var snake = this.state.players[id];

    if ( this.hitBoundaries(snake) || this.hitSnake(snake) ){
        console.log('Player ' + id + ' has died!');
//        GAME_OVER = true;
        this.state.players[id].alive = false;
    }
}

Game.prototype.hitBoundaries = function(snake){
    return ( snake.x <= 0 || snake.y <= 0 || snake.x >= this.width || snake.y >= this.height )
}

Game.prototype.hitSnake = function(this_snake){
    collision = false;
    var snakes = this.state.players;
    for(var i in this.impassible) {
        var block = this.impassible[i];
        if( this_snake.x == block.x && this_snake.y == block.y ){
            collision = true;
            break;
        }
    }

    return collision;
}


Game.prototype.handleMove = function(snake_id, direction) {
    var x, y;
    switch( direction ){
        case 'N':
            x = 0, y = -1; 
            break;
        case 'E':
            x = 1, y = 0; 
            break;
        case 'S':
            x = 0, y = 1; 
            break;
        case 'W':
            x = -1, y = 0; 
            break;
        default:
            break;
    }
    this.moveSnake(snake_id, x, y);

}

Game.prototype.moveSnake = function(id, x, y) {
    var snake = this.state.players[id];

    var new_body_part = {
        x: snake.x,
        y: snake.y
    };
    snake.x += x;
    snake.y += y;

    var body_length = snake.body.push( new_body_part );
    this.impassible.push( new_body_part );

    if( body_length > snake.max_length ) {
        old_body_part = snake.body.shift();
        var index = this.impassible.indexOf(old_body_part);
        if( index != -1 ){
            this.impassible.splice( index, 1 );
        }
    }

    this.state.players[id] = snake;
}

Game.prototype.tickFood = function() {
    this.state.food.timeout -= this.fps;
    if( this.state.food.timeout <= 0 ){
        this.generateFood();
    }
}

Game.prototype.removePlayer = function(conn) {                                                                                                  
    var player = this.state.players[conn.id];
    if( player ) {
        this.state.players[conn.id].alive = false;                                                                                                  
    }
}   
Game.prototype.onTurn = function() {
    this.simulate(this.responses, this.state);
}
Game.prototype.tick = function() {
    this.onTurn();
    this.checkDeadCount();
    this.responses = {};
    return {command: 'state', value: this.state};
}


exports.Game = Game;
