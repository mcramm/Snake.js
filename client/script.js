//var GAME_OVER = false;
//var PAUSED = false;

var keymap = {
    "37": {direction: "W", opposing: "E"},
    "38": {direction: "N", opposing: "S"},
    "39": {direction: "E", opposing: "W"},
    "40": {direction: "S", opposing: "N"}
//    "80":"pause"
};

var direction;

function changeDirection(key) {
    var html = $('#keyContainer').html();
    $('#keyContainer').html(html + " " + key);
    if( direction != key.opposing ) {
        direction = key.direction;
        snake.setDirection( direction );
    }
}

function keyPressed(event) {
    console.log('keypressed!!', event.keyCode);
    var key = keymap[ event.keyCode ];

    if( key != null ) {
        changeDirection(key);
    }

    return;
}

$(document).ready( function() {
    $(document).keydown( function() {
        var key = keymap[ event.keyCode ];
        if( key != null ) {
            changeDirection(key);
        }
    });
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
