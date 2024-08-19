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
        console.log("WebSocket connection established");
    };

    socket.onclose = function () {
        console.log("WebSocket connection closed");
        postMessage({ type: "disconnected" });
    };

    socket.onerror = function (error) {
        console.error("WebSocket error:", error);
    };

    socket.onmessage = function (event) {
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
                postMessage("connected" );
                console.log("BotListUpdate",message.bots);
                break;
            case "RoundStartedEvent":
                // ignore this message
                break;
            case "TickEventForObserver":
                // console.log("TickEventForObserver");
                console.log(message);
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
                break;
            case "stopped":
                postMessage("stopped");
                break;
            default:
                console.log("Unknown message type: ", message.type);
                console.table(message);
                break;
        }
    };
}

var socket = null;
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
                postMessage("connected" );
                console.log("BotListUpdate",message.bots);
                break;
            case "RoundStartedEvent":
                // ignore this message
                break;
            case "TickEventForObserver":
                // console.log("TickEventForObserver");
                console.log(message);
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
                break;
            case "stopped":
                postMessage("stopped");
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
        default:
            console.log("Observer received unknown command: ", e.data);
            break;
    }
}