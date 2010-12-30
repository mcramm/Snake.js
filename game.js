var GAME_OVER = false;
var PAUSED = false;

var Game = function() {
    this.responses = {};
    this.state = this.buildState();
    this.game = {};

    this.width = 600;
    this.height = 500;

    this.colors = ['black', 'red', 'blue', 'yellow'];
    this.fps = 50;

    this.food_timeout = 1; // minutes
    this.food_width = 3;

    this.snake_width = 3;

    this.counter = 0;
    this.no_generate_buffer = 10; // pixel buffer around edge of arena where no food can be generated


}

Game.prototype.buildState = function() {
    var newState = {players: {}, food: {}};
    return newState;
}

Game.prototype.addPlayer = function(conn) {
    var player_number = this.state.players.length + 1;
    if( player_number > 4 ) {
        return;
    }
    var x, y, direction;
    switch( player_number ) {
        case 1:
            x = 25; y = 25; direction = "E";
            break;
        case 2:
            x = 25; y = 400; direction = "N";
            break;
        case 3:
            x = 400; y = 400; direction = "W";
            break;
        case 4:
            x = 400; y = 25; direction = "S";
            break;
    }
    var snake = {
        x: x,
        y: y,
        direction: direction,
        max_length: 10,
        score: 0,
        color: this.colors[ player_number - 1 ],
        alive: true,
        kills: 0,
        body: []
    };

    this.state.players[conn.id] = snake;
}

Game.prototype.simulate = function(responses, old) {
    var state = JSON.parse(JSON.stringify(old));

    for ( var i in responses ){
        var response = responses[i];
        var snake = state.players[i];
        if( snake.alive ) {
            if(response && response.value) {
                this.handleMove(i, response.value);
            }
        }
    }

    for ( var i in this.state.players ) {
        var snake = state.players[i]

        if( !snake.alive ) {
            continue;
        }

        if( this.state.food !== null ){
            this.detectFood(i);
        }


        this.detectCollision(i);
    }


    if( this.state.food === null ) {
        this.generateFood();
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

        this.state.food = null;
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
        console.log('collision!!!!');
//        GAME_OVER = true;
        this.state.players[id].alive = false;
    }
}

Game.prototype.hitBoundaries = function(snake){
    return ( snake.x <= 0 || snake.y <= 0 || snake.x >= this.width || snake.y >= this.height )
}

Game.prototype.hitSnake = function(snake){
    return false;
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

    var body_length = snake.body.push( new_body_part );
    if( body_length > max_length ) {
        old_body_part = snake.body.shift();
    }

    this.state.players[id] = snake;
}

Game.prototype.removePlayer = function(conn) {                                                                                                  
//    var pl = this.state.players[conn.id]                                                                                                        
    this.state.players[conn.id].alive = false;                                                                                                  
}   
Game.prototype.onTurn = function() {
    this.simulate(this.responses, this.state);
}
Game.prototype.tick = function() {
    this.onTurn();
    this.responses = {};
    return {command: 'state', value: this.state};
}

exports.Game = Game;
