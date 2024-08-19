// get the "p" with id "version" and read the version from the attribute "version"
const version = document.getElementById("version").getAttribute("version");
console.log("version: ", version);

// get url, port, and secret from localStorage, if they don't exist, use default values and store them
var url = localStorage.getItem("url") || "localhost";
var port = localStorage.getItem("port") || 7654;
var secret = localStorage.getItem("secret") || "defaultSecret";
var observerName = localStorage.getItem("observer_name") || "Observer";

localStorage.setItem("url", url);
localStorage.setItem("port", port);
localStorage.setItem("secret", secret);
localStorage.setItem("observer_name", observerName);

$(document).ready(function () {
    // set the storaged values in the input fields
    $("input", "#ip_dns").val(url);
    $("input", "#port").val(port);
    $("input", "#secret").val(secret);
    $("input", "#observer_name").val(observerName);

    $("#connect_button").on("click", function () {
        // updates the local variables with the values from the input fields
        observerName = $("input", "#observer_name").val();
        url = $("input", "#ip_dns").val();
        port = $("input", "#port").val();
        secret = $("input", "#secret").val();

        // store the values in the localStorage
        localStorage.setItem("observer_name", observerName);
        localStorage.setItem("url", url);
        localStorage.setItem("port", port);
        localStorage.setItem("secret", secret);

        // stop the observer and start it again with the new values
        stopObserver();
        startObserver();
    });

    var worker = false;

    function stopObserver() {
        // Stop the observer
        if (worker) worker.postMessage({ action: 'stop' });
    }

    function startObserver() {
        // Start the observer with updated values
        if (worker) worker.postMessage({ action: 'start', par1: url, par2: port, par3: secret, par4: observerName });
    }

    // run the observer
    if (window.Worker) {
        worker = new Worker('js/observer.js');

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
                default:wakeLock.release();
                wakeLock = null;
                    console.log("Unknown message: ", event.data);
                    console.table(event.data);
                    break;

            }
        });

        // Send messages to the worker
        worker.postMessage({ action: 'start', par1: url, par2: port, par3: secret, par4: observerName });
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
    if (status) $(".status", "#connection_status").html('<span class="icon"><i class="fa fa-check"></i></span>');
    else $(".status", "#connection_status").html('<span class="icon"><i class="fa fa-times"></i></span>');
}

function updateScreenLockStatus(status) {
    if (status) $(".status", "#screen_lock").html('<span class="icon"><i class="fa fa-check"></i></span>');
    else $(".status", "#screen_lock").html('<span class="icon"><i class="fa fa-times"></i></span>');
}

/**
 * Updates the game status in the UI.
 * 
 * @param {boolean} status - The game status. True if running, false otherwise.
 */
function updateGameStatus(status) {
    switch (status) {
        case "resumed":
            $(".status", "#game_status").html('<span class="icon"><i class="fa fa-play"></i></span>Running');
            break;
        case "paused":
            $(".status", "#game_status").html('<span class="icon"><i class="fa fa-pause"></i></span>Paused');
            break;
        case "stopped":
            $(".status", "#game_status").html('<span class="icon"><i class="fa fa-stop"></i></span>Not running');
            break;
        default:
            console.log("Unknown game status: ", status);
            break;

    }
}