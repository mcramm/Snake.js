manager = function() {
    var keymap = {
        "37": {direction: "W", opposing: "E"},
        "38": {direction: "N", opposing: "S"},
        "39": {direction: "E", opposing: "W"},
        "40": {direction: "S", opposing: "N"}
    };
    var canvas = document.createElement('canvas');
        canvas.setAttribute("width", 600);
        canvas.setAttribute("height", 500);
        canvas.style.backgroundColor = "#F5F5F5;";
        canvas.style.border = "1px solid gray;";

    var gameClt = null;
    var curPlayerId = null;
    var ws = null;

    var direction = "";
    var username = "";

    var onState = function(stateInfo) {};

    var setOnState = function(callback) {
        onState = callback;
    };

    var renderTo = function(containerId) {
        var container = document.getElementById(containerId);
        gameClt = client(canvas);
        container.appendChild(canvas);
    };

    var init = function() {
        var jsIncl = document.createElement('script');
        jsIncl.setAttribute("type", "text/javascript");
        jsIncl.setAttribute("src", "client.js");
        document.head.appendChild(jsIncl);

        $(document).ready( function() {
            $('#login-dialog').show();
            $('#underlay').show();
            $('#login-dialog').center();

            $('#play-button').click( function() {
                    username = $('#username').val();
                    if( username != "" ) {
                        startPlaying();
                    }
            });

            $('#watch-button').click( function() {
                    startWatching();
            });

            $('#username').submit( function() {
                    alert('submitted!');
            });

            $(document).keydown( function() {
                var key = keymap[ event.keyCode ];
                if( key != null ) {
                    changeDirection(key);
                }
            });
        });

    };

    var changeDirection = function(key) {
        var html = $('#keyContainer').html();
        $('#keyContainer').html(html + " " + key);
        if( direction != key.opposing ) {
            direction = key.direction;
            setDirection( direction );
        }
    }

    var keyPressed = function(event) {
        var key = keymap[ event.keyCode ];

        if( key != null ) {
            changeDirection(key);
        }

        return;
    }

    var openConnection = function() {
        $('#login-dialog').hide();
        $('#underlay').hide();
        $('#stats').show();

        ws = new WebSocket("ws://" + gameClt.getServerName());
        ws.onopen = function(evt) {
            console.log('Connected');
        }

        return ws;
    }
    var startWatching = function() {
        ws = openConnection();

        ws.onmessage = function(evt) {
            var data = JSON.parse(evt.data);
            if( data.command == "state" ) {
                gameClt.refresh(data.value);
            }
        };
    }

    var startPlaying = function() {
        ws = openConnection();

        ws.onmessage = function(evt) {
            var data = JSON.parse(evt.data);
            switch (data.command) {
            case "id":
                console.log('received:', data.command);
                curPlayerId = data.value;
                ws.send(JSON.stringify({command: 'username', value: username}));
                break;
            case "state":
                gameClt.refresh(data.value);
                if (data.value.players[curPlayerId] && data.value.players[curPlayerId].alive) {
                    ws.send(JSON.stringify({command: 'action', value: direction}));
                }
                break;
            }
        };
    };

    var setDirection = function(dir) {
        direction = dir;
    }

    init();

    return {
        setDirection: setDirection,
        renderTo: renderTo,
        onState: setOnState,
    };
}();
