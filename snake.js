var Snake = function() {
    this.id = 0;
    this.color = 'black';
    this.direction = "";
    this.score = 0;
    this.max_length = 10;
    this.alive = true;
    this.kills = 0;
    this.username = "";
    this.head = {};
    this.body = [];
}

Snake.prototype.create = function( params ){
    for( var attr in params ) {
        var value = params[attr];
        if( attr == 'color' || attr == 'direction' ){
            var value = "'" + value + "'";
        }
        eval("this." + attr + " = " + value + ";");
    }

}

Snake.prototype.setDirection = function(direction) {
    this.direction = direction;
}

Snake.prototype.move = function() {
    var vector = this.getVector();

    var new_body_part = {
        x: this.head.x,
        y: this.head.y
    };

    this.head.x += vector.x;
    this.head.y += vector.y;

    var body_length = this.body.push( new_body_part );

    var old_body_part = null;
    if( body_length > this.max_length ) {
        old_body_part = this.body.shift();
    }

    return {new_part: new_body_part, old_part: old_body_part};
}

Snake.prototype.getVector = function() {
    var vector = {x: 0, y: 0};

    switch( this.direction ){
        case 'N':
            vector.y -= 1;
            break;
        case 'E':
            vector.x += 1;
            break;
        case 'S':
            vector.y += 1;
            break;
        case 'W':
            vector.x -= 1;
            break;
        default:
            break;
    }

    return vector;
}

Snake.prototype.eatFood = function() {
    this.max_length += 20;
    this.score += 20;
}

exports.Snake = Snake;
