// get the "p" with id "version" and read the version from the attribute "version"
const version = document.getElementById("version").getAttribute("version");
console.log("version: ", version);

// get url, port, and secret from localStorage, if they don't exist, use default values and store them
var url = localStorage.getItem("url") || "localhost";
var port = localStorage.getItem("port") || 7654;
var secret = localStorage.getItem("secret") || "defaultSecret";

localStorage.setItem("url", url);
localStorage.setItem("port", port);
localStorage.setItem("secret", secret);


$(document).ready(function () {
    // run the observer
    if (window.Worker) {
        const worker = new Worker('js/observer.js');

        // Handle messages from the worker
        worker.addEventListener('message', function (event) {
            switch (event.data) {
                case "connected":
                    updateConnectionStatus(true);
                    break;
                case "disconnected":
                    updateConnectionStatus(false);
                    break;
                case "GameStartedEventForObserver":
                    updateGameStatus("resumed");
                case "resumed":
                    updateGameStatus("resumed");
                    break;
                case "paused":
                    updateGameStatus("paused");
                    break;
                case "stopped":
                    updateGameStatus("stopped");
                    break;
                default:
                    console.log("Unknown message: ", event.data);
                    console.table(event.data);
                    break;

            }
        });

        // Send messages to the worker
        worker.postMessage({ action: 'start', par1: url, par2: port, par3: secret });
    }
    else {
        console.log("Web Workers are not supported in this environment.");
    }

});

// UI utils

/**
 * Updates the connection status in the UI.
 * 
 * @param {boolean} status - The connection status. True if connected, false otherwise.
 */
function updateConnectionStatus(status) {
    if (status) $(".status", "tr#connection_status").html('<span class="icon"><i class="fa fa-check"></i></span>Connected');
    else $(".status", "tr#connecction_status").html('<span class="icon"><i class="fa fa-times"></i></span>Disconnected');
}

/**
 * Updates the game status in the UI.
 * 
 * @param {boolean} status - The game status. True if running, false otherwise.
 */
function updateGameStatus(status) {
    switch (status) {
        case "resumed":
            $(".status", "tr#game_status").html('<span class="icon"><i class="fa fa-play"></i></span>Running');
            break;
        case "paused":
            $(".status", "tr#game_status").html('<span class="icon"><i class="fa fa-pause"></i></span>Paused');
            break;
        case "stopped":
            $(".status", "tr#game_status").html('<span class="icon"><i class="fa fa-stop"></i></span>Not running');
            break;
        default:
            console.log("Unknown game status: ", status);
            break;

    }
}