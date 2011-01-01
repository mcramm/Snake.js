var GAME_OVER = false;
var PAUSED = false;

var Snake = require('./snake').Snake;

var Game = function() {
    this.responses = {};
    this.state = this.buildState();
    this.game = {};
    this.impassible = [];

    this.width = 600;
    this.height = 500;

    this.colors = ['black', 'red', 'blue', 'orange', 'magenta', 'cyan', 'olive', 'brown'];
    this.startAttributes = [
        { x: 25, y: 25, direction: "E" },
        { x: 25, y: 475, direction: "N" },
        { x: 475, y: 475, direction: "W" },
        { x: 475, y: 25, direction: "S" }
    ];
    this.fps = 50;

    this.food_timeout = 1; // minutes
    this.food_width = 3;

    this.snake_width = 3;

    this.no_generate_buffer = 10; // pixel buffer around edge of arena where no food can be generated
}

Game.prototype.buildState = function() {
    var newState = {players: {}, food: {}, player_count: 0, dead_count: 0};
    return newState;
}

Game.prototype.addPlayer = function(conn, username) {
    this.state.player_count += 1;
    if( this.allPlayersDead() ) {
        return;
    }
    var color = this.colors[this.state.player_count - 1];

    var index = this.state.player_count;
    if( index > 4 ) {
        index -= 4;
    }

    index--;
    var starting_attr = this.startAttributes[index];

    var snake = new Snake();
    snake.create({
        id: conn.id,
        username: username,
        direction: starting_attr.direction,
        max_length: 10,
        score: 0,
        color: color,
        alive: true,
        kills: 0
    });
    snake.head.x = starting_attr.x;
    snake.head.y = starting_attr.y;

    for( var i = 0; i < snake.max_length; i++ ){
        this.moveSnake( snake );
    }

    this.state.players[conn.id] = snake;
}

Game.prototype.removePlayer = function(conn) {
    var snake = this.state.players[conn.id];
    if( snake ) {
        this.state.dead_count += 1;
        this.state.players[conn.id].alive = false;
    }
}

Game.prototype.allPlayersDead = function() {
    if( this.state.player_count > 8 ) {
        console.log("Max number of players reached, will restart server when everyone is dead (current is " + this.state.dead_count+ ")");
        if( this.state.dead_count >= 8 ) {
            this.reset();
            this.state.player_count = 0;
        }
        return true;
    } else {
        return false;
    }
}

Game.prototype.moveSnake = function(snake, direction) {
    if( direction == null ){
        direction = snake.direction;
    }
    snake.setDirection( direction );
    var body_parts = snake.move();
    this.addImpassible( body_parts );
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
        var snake = this.state.players[i];
        if( !snake.alive ) {
            continue;
        }
        if( direction ){
            this.moveSnake( snake, direction );
        }
        if( this.state.food !== null ){
            this.detectFood(snake);
        }


        this.detectCollision(snake);
    }

    if( this.state.food.x == null ) {
        this.generateFood(snake);
    } else {
        this.tickFood();
    }

}

Game.prototype.addImpassible = function(body_parts) {
    this.impassible.push( body_parts.new_part );

    if( body_parts.old_part != null ){
        var index = this.impassible.indexOf(body_parts.old_part);
        this.impassible.splice( index, 1 );
    }
}

Game.prototype.detectCollision = function(snake){
    var x = snake.head.x;
    var y = snake.head.y;

    if ( this.hitBoundaries(x, y) || this.hitSnake(x, y) ){
        console.log('Player ' + snake.username + ' has died!');
        this.state.dead_count += 1;
        snake.alive = false;
    }
}

Game.prototype.printImpassible = function() {
        var str = "";
        for(var i in this.impassible ) {
            var b = this.impassible[i];

            str += "block at {x:" + b.x + ", y:" +b.y+ "}";
        }
        console.log(str);
}

Game.prototype.hitBoundaries = function(x, y){
    return ( x <= 0 || y <= 0 || x >= this.width || y >= this.height )
}

Game.prototype.hitSnake = function(x, y){
    collision = false;

    for(var i in this.impassible) {
        var block = this.impassible[i];
        if( x == block.x && y == block.y ){
            this.state.players[block.id].kills += 1;
            collision = true;
            break;
        }
    }

    return collision;
}

Game.prototype.checkCoord = function( coord_start, coord_end, target_start, target_end ) {
    var check_start = (coord_start >= target_start && coord_start <= target_end);
    var check_end = (coord_end >= target_start && coord_end <= target_end);

    return ( check_start || check_end );
}

Game.prototype.detectFood = function(snake) {
    var x = snake.head.x;
    var y = snake.head.y;

    var sw = this.snake_width;
    var fx = this.state.food.x;
    var fy = this.state.food.y;
    var fw = this.food_width;

    var x_collision = this.checkCoord( x, x+sw, fx, fx+fw);
    var y_collision = this.checkCoord( y, y+sw, fy, fy+fw);

    if( x_collision && y_collision ) {
        snake.eatFood();
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

Game.prototype.tickFood = function() {
    this.state.food.timeout -= this.fps;
    if( this.state.food.timeout <= 0 ){
        this.generateFood();
    }
}

Game.prototype.onTurn = function() {
    this.simulate(this.responses, this.state);
}

Game.prototype.tick = function() {
    this.onTurn();
    this.allPlayersDead();
    this.responses = {};
    return {command: 'state', value: this.state};
}

exports.Game = Game;
