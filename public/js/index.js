// get the "p" with id "version" and read the version from the attribute "version"
const version = document.getElementById("version").getAttribute("version");
console.log("version: ", version);

// const ctx = $("#battlefield")[0].getContext("2d"); //foreground ak battlefield canvas object

// get url, port, and secret from localStorage, if they don't exist, use default values and store them
var url = localStorage.getItem("url") || "localhost";
var port = localStorage.getItem("port") || 7654;
var secret = localStorage.getItem("secret") || "defaultSecret";
var observerName = localStorage.getItem("observer_name") || "Observer";

localStorage.setItem("url", url);
localStorage.setItem("port", port);
localStorage.setItem("secret", secret);
localStorage.setItem("observer_name", observerName);

var observer = false;
// backround canvas context
const background_htmlcanvas = document.getElementById("background");
const background_context = background_htmlcanvas.getContext("2d");

// battlefield canvas context
const battlefield_htmlcanvas = document.getElementById("battlefield");
const battlefield_offscreen = battlefield_htmlcanvas.transferControlToOffscreen();

function stopObserver() {
    // Stop the observer
    if (observer) observer.postMessage({ action: 'stop' });
}

function startObserver() {
    // Start the observer with updated values
    if (observer) observer.postMessage({ action: 'start', par1: url, par2: port, par3: secret, par4: observerName });
}

function runObserver() {
    // run the observer
    if (window.Worker) {
        observer = new Worker('js/observer.js');

        // Handle messages from the worker
        observer.addEventListener('message', function (event) {
            if (event.data.serverVersion) {
                updateServerVersion(event.data.serverVersion);
            }
            else {
                switch (event.data) {
                    case "connected":
                        updateConnectionStatus(true);

                        // draw the battlefields
                        sizeCanvas();

                        drawBackground(background_context);

                        // draw the battlefield
                        // pass the battlefield canvas sizes to the observer
                        observer.postMessage({ canvas: battlefield_offscreen }, [battlefield_offscreen]);

                        // send the canvas sizes to the observer
                        observer.postMessage({ action: 'size', par1: background_htmlcanvas.width, par2: background_htmlcanvas.height });
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
                    case "tick":
                        updateGameStatus("resumed");
                }
            }
        });

        // Send messages to the worker
        observer.postMessage({ action: 'start', par1: url, par2: port, par3: secret, par4: observerName });
    }
    else {
        console.log("Web Workers are not supported in this environment.");
    }
}

// Battlefield drawing
function sizeCanvas() {
    // constant for the window width and height
    var screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth || 0;
    var screenHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || 0;

    const is_landscape = screenWidth > screenHeight;

    // calculate the ratio
    var ratio = Math.min(screenWidth / gameSetup.arenaWidth, screenHeight
        / gameSetup.arenaHeight);

    var canvasWidth = is_landscape ? gameSetup.arenaWidth * ratio : screenWidth;
    var canvasHeight = is_landscape ? screenHeight : gameSetup.arenaHeight * ratio;

    var leftOffset = Math.max(0, (screenWidth - canvasWidth) / 2);
    var topOffset = Math.max(0, (screenHeight - canvasHeight) / 2);

    var gameCanvases = document.getElementsByClassName("gamecanvas");
    for (var i = 0; i < gameCanvases.length; i++) {
        gameCanvases[i].style.left = leftOffset + "px";
        gameCanvases[i].style.top = topOffset + "px";
        gameCanvases[i].setAttribute("width", canvasWidth);
        gameCanvases[i].setAttribute("height", canvasHeight);
    }

    // pass the ratio to the observer
    observer.postMessage({ action: 'ratio', par1: ratio });
    // send the canvas sizes to the observer
    observer.postMessage({ action: 'size', par1: canvasWidth, par2: canvasHeight });
}

// Event listeners
function enableListeners() {
    document.getElementById("connect_button").addEventListener("click", function () {
        // updates the local variables with the values from the input fields
        observerName = document.querySelector("#observer_name input").value;
        url = document.querySelector("#ip_url input").value;
        port = document.querySelector("#port input").value;
        secret = document.querySelector("#secret input").value;

        // store the values in the localStorage
        localStorage.setItem("observer_name", observerName);
        localStorage.setItem("url", url);
        localStorage.setItem("port", port);
        localStorage.setItem("secret", secret);

        // stop the observer and start it again with the new values
        stopObserver();
        startObserver();
    });

    window.addEventListener("resize", function () {
        // Handle document size change
        // sizeCanvas();
        // drawBackground(background_context);

        // fade out all ".gamecanvas" elements
        const gameCanvases = document.getElementsByClassName("block");
        for (var i = 0; i < gameCanvases.length; i++) {
            gameCanvases[i].style.opacity = 0;
        }

        // reload page
        location.reload();
    });

    // Add a click event on buttons to open a specific modal
    (document.querySelectorAll('.js-modal-trigger') || []).forEach(($trigger) => {
        const modal = $trigger.dataset.target;
        const $target = document.getElementById(modal);

        $trigger.addEventListener('click', () => {
            openModal($target);
        });
    });

    // Add a click event on various child elements to close the parent modal
    (document.querySelectorAll('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button') || []).forEach(($close) => {
        const $target = $close.closest('.modal');

        $close.addEventListener('click', () => {
            closeModal($target);
        });
    });

    // Add a keyboard event to close all modals
    document.addEventListener('keydown', (event) => {
        if (event.key === "Escape") {
            closeAllModals();
        }
    });
}

function drawBackground(bctx) {
    bctx.clearRect(0, 0, bctx.canvas.width, bctx.canvas.height)
    bctx.fillStyle = "rgba(50, 50, 50, 0.9)";
    bctx.fillRect(0, 0, bctx.canvas.width, bctx.canvas.height)
    // bctx.fillStyle = 'lime'

    // // north
    // canvas_arrow(bctx, bctx.canvas.width / 2, bctx.canvas.height / 2, bctx.canvas.width / 2, 20)
    // bctx.fillText('90', bctx.canvas.width / 2 - 8, 12)

    // // south
    // canvas_arrow(bctx, bctx.canvas.width / 2, bctx.canvas.height / 2, bctx.canvas.width / 2, bctx.canvas.height - 20)
    // bctx.fillText('270', bctx.canvas.width / 2 - 6, bctx.canvas.height - 4)

    // // west
    // canvas_arrow(bctx, bctx.canvas.width / 2, bctx.canvas.height / 2, 20, bctx.canvas.height / 2)
    // bctx.fillText('180', 2, bctx.canvas.height / 2 + 3)

    // // east
    // canvas_arrow(bctx, bctx.canvas.width / 2, bctx.canvas.height / 2, bctx.canvas.width - 20, bctx.canvas.height / 2)
    // bctx.fillText('0', bctx.canvas.width - 8, bctx.canvas.height / 2 + 3)

    // bctx.strokeStyle = "black"
    // bctx.stroke()

    // // axes
    // canvas_arrow(bctx, 1, bctx.canvas.height - 1, 1, 1) // Y
    // canvas_arrow(bctx, 1, bctx.canvas.height - 1, bctx.canvas.width - 1, bctx.canvas.height - 1) // X

    // bctx.strokeStyle = "lime"
    // bctx.stroke()
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

document.addEventListener('DOMContentLoaded', function () {
    // set the storaged values in the input fields
    document.querySelector("#ip_url input").value = url;
    document.querySelector("#port input").value = port;
    document.querySelector("#secret input").value = secret;
    document.querySelector("#observer_name input").value = observerName;

    // enable the listeners
    enableListeners();

    // run the observer
    runObserver();

    // TEMP: load the gameSetup from file
    // console.table(gameSetup); // gameSetup is defined in public/js/gameSetup.js loaded in index.html

    // fade in all ".gamecanvas" elements
    const gameCanvases = document.getElementsByClassName("gamecanvas");
    for (var i = 0; i < gameCanvases.length; i++) {
        gameCanvases[i].style.transition = "opacity 0.5s";
        gameCanvases[i].style.opacity = 1;
    }
});

/**
 * Updates the connection status in the UI.
 * 
 * @param {boolean} status - The connection status. True if connected, false otherwise.
 */
function updateConnectionStatus(status) {
    const statusElement = document.querySelector("#connection_status .status");
    if (status) {
        statusElement.innerHTML = '<span class="icon"><i class="fa fa-check"></i></span>';
    } else {
        statusElement.innerHTML = '<span class="icon"><i class="fa fa-times"></i></span>';
        updateServerVersion('<span class="icon"><i class="fa fa-question"></i></span>');
        updateGameStatus("stopped");
    }
}

/**
 * Updates the game status in the UI.
 * 
 * @param {boolean} status - The game status. True if running, false otherwise.
 */
function updateGameStatus(status) {
    const gameStatusElement = document.querySelector("#game_status .status");
    switch (status) {
        case "resumed":
            gameStatusElement.innerHTML = '<span class="icon"><i class="fa fa-check"></i></span>';
            break;
        case "paused":
            gameStatusElement.innerHTML = '<span class="icon"><i class="fa fa-pause"></i></span>';
            break;
        case "stopped":
            gameStatusElement.innerHTML = '<span class="icon"><i class="fa fa-times"></i></span>';
            break;
        case "unknown":
            gameStatusElement.innerHTML = '<span class="icon"><i class="fa fa-question"></i></span>';
            break;
        default:
            gameStatusElement.innerHTML = '<span class="icon"><i class="fa fa-question"></i></span>';
            console.log("Unknown game status: ", status);
            break;
    }
}

function updateServerVersion(version) {
    const versionElement = document.querySelector("#server_version .status");
    versionElement.innerHTML = version;
}

// Functions to open and close a modal
function openModal($el) {
    $el.classList.add('is-active');
}

function closeModal($el) {
    $el.classList.remove('is-active');
}

function closeAllModals() {
    (document.querySelectorAll('.modal') || []).forEach(($modal) => {
        closeModal($modal);
    });
}