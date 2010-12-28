var GAME_OVER = false;

var keymap = {
    "37":"W",
    "38":"N",
    "39":"E",
    "40":"S"
};

var food = {};

var width = 3;
var snake = {
    x: 0,
    y: 0,
    direction: 'N',
    speed: 1,
    length: 10,
    body: []
};

function keyPressed(key) {
    var html = $('#keyContainer').html();
    $('#keyContainer').html(html + " " + key);
    snake.direction = key;

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
    if( snake.x >= food.x && snake.x <= food.x+width && snake.y >= food.y && snake.y <= food.y+width) {
        snake.length += 20;
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
        ctx.fillRect(snake.x,snake.y,width,width);  
        for(var i in snake.body) {
            var part = snake.body[i];
            ctx.fillRect( part.x, part.y, width, width);
        }

        ctx.fillStyle = "#00A308";
        ctx.fillRect( food.x, food.y, width, width );
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
    var randomX = Math.floor( Math.random()  * gameArea.width);
    var randomY = Math.floor( Math.random()  * gameArea.height);

    food = { 
        x: randomX,
        y: randomY
    };
}

$(document).ready( function() {
    initPlayer();
    generateFood();
    drawGame();

    $(document).keydown( function(event) {
        key = keymap[ event.keyCode ];

        if( key == null ) {
            return;
        }

        keyPressed(key);
    });
    
    gameCycle();
});

function gameCycle(){
    move();
    if( GAME_OVER ){
        return;
    }
    drawGame();
    setTimeout(gameCycle, 1000/30);
}


