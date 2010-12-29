var GAME_OVER = false;
var PAUSED = false;

var keymap = {
    "37":"W",
    "38":"N",
    "39":"E",
    "40":"S",
    "80":"pause"
};

var opposing_dir = {
    "N":"S",
    "S":"N",
    "E":"W",
    "W":"E",
};

var food = {};

var counter = 0;
var fps = 30;
var food_width = 3;
var snake_width = 3;
var food_timeout = 1; // minutes
var no_generate_buffer = 10; // pixel buffer around edge of arena where no food can be generated

var snake = {
    x: 0,
    y: 0,
    direction: 'N',
    speed: 1,
    length: 10,
    score: 0,
    body: []
};

function keyPressed(key) {
    var html = $('#keyContainer').html();
    $('#keyContainer').html(html + " " + key);
    if( opposing_dir[snake.direction] != key ) {
        snake.direction = key;
    }
}

function move() {
    var moveStep = snake.speed;
    var direction = snake.direction;

    switch( direction ){
        case 'N':
            moveSnake(0, -1);
            break;
        case 'E':
            moveSnake(1, 0);
            break;
        case 'S':
            moveSnake(0, 1);
            break;
        case 'W':
            moveSnake(-1, 0);
            break;
        default:
            break;
    }
}

function moveSnake(x, y){
    var max_length = snake.length;

    var new_body_part = {
        x: snake.x,
        y: snake.y
    };
    snake.x += x;
    snake.y += y;

    var body_length = snake.body.push( new_body_part );
    if( body_length > max_length ) {
        old_body_part = snake.body.shift();
    }

    detectCollision();
    detectFood();

}

function detectCollision(){
    if ( hitBoundaries() || hitSnake() ){
        alert('collision!');
        GAME_OVER = true;
    }
}

function detectFood() {
    if( (snake.x >= food.x && snake.x <= food.x+food_width ||
            snake.x + snake_width >= food.x && snake.x + snake_width <= food.x+food_width) &&
        (snake.y >= food.y && snake.y <= food.y+food_width ||
            snake.y + snake_width >= food.y && snake.y + snake_width <= food.y+food_width)) {
        snake.length += 20;
        snake.score += 20;
        generateFood();
    }
}

function hitBoundaries() {
    var gameArea = document.getElementById('drawArea');
    return ( snake.x <= 0 || snake.y <= 0 || snake.x >= gameArea.width || snake.y >= gameArea.height )
}

function hitSnake(){
    collision = false;
    for(var i in snake.body){
        var part = snake.body[i];
        if( snake.x == part.x && snake.y == part.y ){
            collision = true;
            break;
        }
    }
    return collision;
}

function drawGame(){
    var canvas = document.getElementById('drawArea');  
    if (canvas.getContext){  
        var ctx = canvas.getContext('2d');  

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillRect(snake.x,snake.y,snake_width,snake_width);
        ctx.strokeRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        for(var i in snake.body) {
            var part = snake.body[i];
            ctx.fillRect( part.x, part.y, snake_width, snake_width);
        }

        ctx.fillStyle = "#00A308";
        ctx.fillRect( food.x, food.y, food_width, food_width );
        ctx.fillStyle = "#000000";
    }
}
function initPlayer(){
    var gameArea = document.getElementById('drawArea');
    snake.x = gameArea.width / 2;
    snake.y = gameArea.height / 2;
}
function generateFood(){
    var gameArea = document.getElementById('drawArea');
    var randomX = Math.floor( Math.random()  * gameArea.width - (no_generate_buffer * 2)) + no_generate_buffer;
    var randomY = Math.floor( Math.random()  * gameArea.height - (no_generate_buffer * 2)) + no_generate_buffer;

    food = { 
        x: randomX,
        y: randomY,
        timeout: (food_timeout * 60 * 1000)
    };
}

$(document).ready( function() {
    initPlayer();
    generateFood();
    drawGame();

    $(document).keydown( function(event) {
        key = keymap[ event.keyCode ];

        if( key != null ) {
            if( key == 'pause' ) {
                if( PAUSED ) {
                    PAUSED = false;
                    $('#paused').hide();
                    $('#underlay').hide();
                } else {
                    PAUSED = true;
                    $('#paused').center();
                    $('#paused').show();
                    $('#underlay').show();

                }
            } else if( !PAUSED && !GAME_OVER ){
                keyPressed(key);
            }
        }

        return;
    });
    
    gameCycle();
});

function gameCycle(){
    if( GAME_OVER ){
        return;
    }

    if( !PAUSED ) {
        move();
        checkFood();
        calculateScore();
        updateStats();
        drawGame();
    }

    setTimeout(gameCycle, 1000/fps);
}

function checkFood() {
    food.timeout -= (1*fps);
    if( food.timeout <= 0 ){
        generateFood();
    }
}

function updateStats() {
    $('#score').html( snake.score );
    $('#length').html( snake.length );
}

function calculateScore(){
    counter += 1000/fps;
    if (counter >= 1000 * 10 ) {
        snake.score += (2 * snake.length);
        snake.length += 5;
        counter = 0;
    }
}


jQuery.fn.center = function () {
    this.css("position","absolute");
    this.css("top", ( $(window).height() - this.height() ) / 2+$(window).scrollTop() - 100 + "px");
    this.css("left", ( $(window).width() - this.width() ) / 2+$(window).scrollLeft() + "px");
    return this;
}

