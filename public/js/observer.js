var battlefield_canvas = null;
var battlefield_ctx = null;
var socket = null;
var ratio = 1;

// physics rules
const radarRadius = 1200; // radar max distance
const oneDegree = Math.PI / 180.0; // one degree in radians
const gun_radius = 36; // dimension of gun cannon

/**
 * Connects to a WebSocket server using the specified URL, port, and observer name.
 * 
 * @param {string} url - The URL of the WebSocket server.
 * @param {number} port - The port number of the WebSocket server.
 * @param {string} secret - The secret parameter for the WebSocket connection.
 * @param {string} observer_name - The name of the observer.
 */
function connectToServer(url, port, secret, observer_name) {
    // console.log("Connecting to server: ", url, ":", port, " with secret: ", secret);
    socket = new WebSocket(`ws://${url}:${port}`);

    socket.onopen = function () {
        // console.log("WebSocket connection established");
    };

    socket.onclose = function () {
        // console.log("WebSocket connection closed");
        postMessage({ type: "disconnected" });
    };

    socket.onerror = function (error) {
        console.error("WebSocket error:", error);
    };

    socket.onmessage = function (event) {
        // if (battlefield_ctx == null) {
        //     console.log("battlefield_ctx is null");
        //     return;
        // }

        // Handle the incoming message here
        // data is in json format, convert it into an object
        const message = JSON.parse(event.data);

        // switch on message.type
        switch (message.type) {
            case "ServerHandshake":
                // send a handshake response
                var observer_handshake = {
                    sessionId: message.sessionId,
                    type: "ObserverHandshake",
                    name: observer_name,
                    version: "1.0",
                    secret: secret,
                };
                socket.send(JSON.stringify(observer_handshake));
                break;
            case "BotListUpdate":
                // inform the main thread about the connection have been established
                postMessage("connected");
                console.table(message.bots);
                break;
            case "RoundStartedEvent":
                // ignore this message
                break;
            case "TickEventForObserver":
                // console.log("TickEventForObserver");
                console.log("TickEventForObserver", message);

                clearBattlefield()

                message.botStates.forEach((botstate) => {
                    var bot_centerX = botstate.x * ratio;
                    var bot_centerY = botstate.y * ratio;

                    // ctx.lineWidth = 2 * ratio;

                    // radar
                    drawRadar(
                        botstate,
                        ratio,
                        bot_centerX,
                        bot_centerY,
                        radarRadius,
                    );

                    // gun
                    drawGun(botstate, ratio, bot_centerX, bot_centerY, gun_radius);

                    // direction
                    drawDirection(botstate, bot_centerX, bot_centerY, ratio);

                    // hitting circle
                    let hittingCircle_radius = drawHittingCircle(
                        botstate,
                        ratio,
                        bot_centerX,
                        bot_centerY,
                    );

                    // ID
                    // drawId(ctx, botstate, bot_centerX, bot_centerY, ratio, hittingCircle_radius)
                });
                message.bulletStates.forEach((bulletState) => {
                    drawBullet(bulletState, ratio);
                });

                break;
            case "GameStartedEventForObserver":
                postMessage("resumed");
                break
            case "GameResumedEventForObserver":
                postMessage("resumed");
                break;
            case "GamePausedEventForObserver":
                postMessage("paused");
                break;
            case "GameAbortedEvent":
                postMessage("stopped");
                clearBattlefield();
                break;
            case "stopped":
                postMessage("stopped");
                clearBattlefield();
                break;
            default:
                console.log("Unknown message type: ", message.type);
                console.table(message);
                break;
        }
    };
}

var started = false;
onmessage = function (e) {
    // console.log("Observer received message: ", e.data);

    if (e.data.canvas instanceof OffscreenCanvas) { // OffscreenCanvas
        battlefield_canvas = e.data.canvas;
        battlefield_ctx = battlefield_canvas.getContext('2d');
    }
    else {
        const { action, par1, par2, par3, par4 } = e.data;
        // switch on e.data
        switch (action) {
            case "start":
                const url = par1;
                const port = par2;
                const secret = par3;
                const observer_name = par4;
                if (started) {
                    console.log("Observer already started");
                    return;
                }
                started = true;
                connectToServer(url, port, secret, observer_name);
                break;
            case "stop":
                if (!started) {
                    console.log("Observer already stopped");
                    return;
                }
                // close the socket
                socket.close();
                started = false;
                this.postMessage("disconnected");
                break;
            case "ratio":
                ratio = par1;
                break;
            case "size":
                if (battlefield_canvas != null) {
                    battlefield_canvas.width = par1;
                    battlefield_canvas.height = par2;
                }
                break;
            default:
                console.log("Observer received unknown command: ", e.data);
                break;
        }
    }
}

function clearBattlefield() {
    battlefield_ctx.clearRect(0, 0, battlefield_ctx.canvas.width, battlefield_ctx.canvas.height)
}

function drawRadar(botstate, ratio, x, y, radarRadius) {
    y = battlefield_canvas.height - y

    var radar_radius = radarRadius * ratio

    var angle1 = -botstate.radarDirection - botstate.radarSweep
    var angle2 = -botstate.radarDirection
    if (angle1 > angle2) {
        var from_angle = angle1
        var to_angle = angle2
    }
    else {
        var from_angle = angle2
        var to_angle = angle1
    }

    // from
    var linetoX1 = radar_radius * Math.cos((from_angle) * oneDegree) + x
    var linetoY1 = radar_radius * Math.sin((from_angle) * oneDegree) + y

    // to
    var linetoX2 = radar_radius * Math.cos((to_angle) * oneDegree) + x
    var linetoY2 = radar_radius * Math.sin((to_angle) * oneDegree) + y

    // drawing
    battlefield_ctx.beginPath()
    battlefield_ctx.moveTo(linetoX1, linetoY1)
    battlefield_ctx.lineTo(x, y)
    battlefield_ctx.lineTo(linetoX2, linetoY2)

    // style
    // battlefield_ctx.setLineDash([5,4])
    battlefield_ctx.strokeStyle = botstate.scanColor ? botstate.scanColor : 'white'

    // draw!
    battlefield_ctx.stroke()
}

function drawHittingCircle(botstate, ratio, x, y) {
    y = battlefield_canvas.height - y
    var hittingCircle_radius = 18 * ratio
    battlefield_ctx.beginPath()
    battlefield_ctx.arc(x, y, hittingCircle_radius, 0, 2 * Math.PI, false)
    battlefield_ctx.fillStyle = botstate.bodyColor ? botstate.bodyColor : 'white'
    battlefield_ctx.fill()
    return hittingCircle_radius
}

function drawGun(botstate, ratio, x, y, gun_radius) {
    y = battlefield_canvas.height - y
    var angle = -botstate.gunDirection
    var linetoX = gun_radius * ratio * Math.cos((angle) * oneDegree) + x
    var linetoY = gun_radius * ratio * Math.sin((angle) * oneDegree) + y

    // drawing
    battlefield_ctx.moveTo(x, y)
    battlefield_ctx.lineTo(linetoX, linetoY)

    // style
    // battlefield_ctx.setLineDash([])
    battlefield_ctx.strokeStyle = botstate.gunColor ? botstate.gunColor : 'white'

    // draw!
    battlefield_ctx.stroke()
}

function drawDirection(botstate, x, y, ratio) {
    y = battlefield_canvas.height - y
    battlefield_ctx.moveTo(x, y)
    var angle = -botstate.direction
    var linetoX = 50 * ratio * Math.cos((angle) * oneDegree) + x
    var linetoY = 50 * ratio * Math.sin((angle) * oneDegree) + y
    battlefield_ctx.setLineDash([])
    battlefield_ctx.strokeStyle = botstate.bodyColor ? botstate.bodyColor : 'white'
    canvas_arrow(battlefield_ctx, x, y, linetoX, linetoY)
    battlefield_ctx.stroke()
}

function drawBullet(bulletState, ratio) {
    var x = bulletState.x * ratio
    var y = battlefield_canvas.height - bulletState.y * ratio

    var radius = 1 + bulletState.power * ratio * 2
    battlefield_ctx.beginPath()
    battlefield_ctx.arc(x, y, radius, 0, 2 * Math.PI, false)
    battlefield_ctx.fillStyle = bulletState.color ? bulletState.color : 'white'
    battlefield_ctx.fill()
}

function drawId(botState, x, y, ratio, hittingCircle_radius) {
    y = battlefield_canvas.height - y
    battlefield_ctx.fillStyle = botState.bodyColor ? 'white' : 'black'
    battlefield_ctx.font = `${hittingCircle_radius}px Arial`
    var shift = (hittingCircle_radius * 0.5)
    battlefield_ctx.fillText(botState.id, x - shift, y + shift)
}

function canvas_arrow(context, fromx, fromy, tox, toy) {
    var headlen = 10; // length of head in pixels
    var dx = tox - fromx;
    var dy = toy - fromy;
    var angle = Math.atan2(dy, dx);
    context.moveTo(fromx, fromy);
    context.lineTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    context.moveTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
}