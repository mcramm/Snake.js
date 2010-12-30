botclient = function() {
    var canvas = document.createElement('canvas');
        canvas.setAttribute("width", 600);
        canvas.setAttribute("height", 500);
        canvas.style.backgroundColor = "#F5F5F5;";
        canvas.style.border = "1px solid gray;";

    var gameClt = null;
    var curPlayerId = null;
    var ws = null;

    var direction = "";

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
//        var jsIncl = document.createElement('script');
//        jsIncl.setAttribute("type", "text/javascript");
//        jsIncl.setAttribute("src", "client.js");
//        document.head.appendChild(jsIncl);
        gameClt = client(canvas);
    };

    var ready = function() {
        ws = new WebSocket("ws://" + gameClt.getServerName());
        ws.onopen = function(evt) {
            console.log('Connected');
        }

        ws.onmessage = function(evt) {
            var data = JSON.parse(evt.data);
            switch (data.command) {
            case "id":
                console.log('received:', data.command);
                curPlayerId = data.value;
                gameClt.setCurrentPlayerId(curPlayerId);
                break;
            case "state":
                gameClt.refresh(data.value);
                if (data.value.players[curPlayerId].alive) {
                    var action = onState(data.value);
                    ws.send(JSON.stringify({command: 'action', value: direction}));
                }
                break;
            }
        };
    };


    var getPlayerId = function() {
        return curPlayerId;
    };

    init();

    return {
        getPlayerId: getPlayerId,
        renderTo: renderTo,
        ready: ready,
        onState: setOnState,
    };
}();
