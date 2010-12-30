//var GAME_OVER = false;
//var PAUSED = false;

var keymap = {
    "37": {direction: "W", opposing: "E"},
    "38": {direction: "N", opposing: "S"},
    "39": {direction: "E", opposing: "W"},
    "40": {direction: "S", opposing: "N"}
//    "80":"pause"
};

var direction = "";

function changeDirection(key) {
    var html = $('#keyContainer').html();
    $('#keyContainer').html(html + " " + key);
    if( direction != key.opposing ) {
        direction = key.direction;
    }

}

function keyPressed(event) {
    var key = keymap[ event.keyCode ];

    if( key != null ) {
        changeDirection(key);
    }

    return;
}

//function drawGame(){
//    var canvas = document.getElementById('drawArea');  
//    if (canvas.getContext){  
//        var ctx = canvas.getContext('2d');  
//
//        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
//        ctx.fillRect(snake.x,snake.y,snake_width,snake_width);
//        ctx.strokeRect(0, 0, ctx.canvas.width, ctx.canvas.height);
//        for(var i in snake.body) {
//            var part = snake.body[i];
//            ctx.fillRect( part.x, part.y, snake_width, snake_width);
//        }
//
//        ctx.fillStyle = "#00A308";
//        ctx.fillRect( food.x, food.y, food_width, food_width );
//        ctx.fillStyle = "#000000";
//    }
//}

$(document).ready( function() {

    $(document).keydown( keyPressed(event) );
//    drawGame();
});

botclient.onState(function(stateInfo) {
    if( direction = "" ) {
        return;
    }

    return {
        action: 'move'
        value: direction;
    };
});


//function updateStats() {
//    $('#score').html( snake.score );
//    $('#length').html( snake.length );
//}

//function calculateScore(){
//    counter += 1000/fps;
//    if (counter >= 1000 * 10 ) {
//        snake.score += (2 * snake.length);
//        snake.length += 5;
//        counter = 0;
//    }
//}


//jQuery.fn.center = function () {
//    this.css("position","absolute");
//    this.css("top", ( $(window).height() - this.height() ) / 2+$(window).scrollTop() - 100 + "px");
//    this.css("left", ( $(window).width() - this.width() ) / 2+$(window).scrollLeft() + "px");
//    return this;
//}

