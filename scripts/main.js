import { Player } from "./players.js";
import { Button } from "./buttons.js";
import { Page } from "./page.js";

import p5 from 'https://cdn.skypack.dev/p5';


/** ###### KINECT DATA ###### **/

//TODO: Iterate through available sockets until successful connection found
var host = "cpsc484-01.stdusr.yale.internal:8888";

$(document).ready(function () {
    frames.start();
});

var frames = {
    socket: null,

    start: function () {
        var url = "ws://" + host + "/frames";
        frames.socket = new WebSocket(url);
        frames.socket.onmessage = function (event) {
            const frame = JSON.parse(event.data);
            frames.show(frame);
            updateGameState(frame); // Make sure this updates players based on the new frame data

        }
    },

    show: function (frame) {
        console.log(frame);
    }
};


/** ###### GLOBAL VARIABLES ###### **/
let buttons = []; // Array to hold buttons
let players = [new Player(1), new Player(2), /* ADDING THIRD PLAYER FOR TESTING */ new Player(3)];
let currentPage = null;
let pages = {}; // Object to hold pages by name

function getWristPositions(person) {
    // Placeholder implementation
    let wrists = [];
    if (person.joints) {
        // `joints` is an array and you know the indices or identifiers for the wrists
        let leftWrist = person.joints[7];  //LEFT WRIST INDEX = 7
        let rightWrist = person.joints[14];  //RIGHT WRIST INDEX = 14

        // Convert positions to canvas space if necessary
        wrists.push({x: leftWrist.position.x, y: leftWrist.position.y});
        wrists.push({x: rightWrist.position.x, y: rightWrist.position.y});
    }
    return wrists;
}

function updateGameState(frame) {
    // Reset players' wrist validity each frame
    players.forEach(player => {
        player.leftWrist.valid = false;
        player.rightWrist.valid = false;
    });

    // Update wrist positions for the first two detected people
    
    const people = Object.values(frame.people);
    for (let i = 0; i < people.length && i < players.length; i++) {
        players[i].updateJoints(people[i].joints);
    }
}

function loadButtons(pageButtons) {
    // Clear the existing buttons array
    buttons.length = 0;

    // Check if the currentPage has buttons and add them to the global buttons array
    if (pageButtons && Array.isArray(pageButtons)) {
        pageButtons.forEach(button => {
            buttons.push(button);
        });
    }
}

function setCurrentPage(pageName) {
    if (pages[pageName]) {
        currentPage = pages[pageName];
        loadButtons(currentPage.buttons);
    }
}

/** ###### PAGES ###### **/
function setupHomePage(s) {
    let homePage = new Page('Home');

    // Set the background color to a deep blue as seen in the image
    homePage.backgroundColor = [25, 118, 210]; // Example RGB color, adjust as needed

    // Create a Play button
    let startButton = new Button(
        s.width / 2 - 50,
        s.height / 2 - 25,
        100,
        50,
        'PLAY',
        false,
        () => setCurrentPage('instructions', s)
    );

    // Add the start button to the home page
    homePage.addButton(startButton);

    // Text styles should be added as methods on the Page class to handle rendering
    homePage.addTitle = function() {
        s.fill(255); // White text
        s.textAlign(s.CENTER, s.CENTER);
        s.textSize(32);
        s.text('WANT TO MEET SOMEONE NEW?', s.width / 2, s.height / 2 - 100);
        s.text('TRY THIS 2-PLAYER GAME!', s.width / 2, s.height / 2 - 60);
    };

    homePage.addTip = function() {
        s.fill(255); // White text
        s.textAlign(s.CENTER, s.BOTTOM);
        s.textSize(16);
        s.text('Tip: Hold up your hands to reveal your cursor!', s.width / 2, s.height - 30);
    };

    homePage.addMotionText = function() {
        s.fill(255, 255, 255, 128); // White text with some transparency
        s.textAlign(s.CENTER, s.BOTTOM);
        s.textSize(16);
        s.text('Detecting motion...', s.width / 2, s.height / 2 + 100);
    };

    // Draw method on Page class should call these text methods
    homePage.draw = function() {
        s.background(this.backgroundColor);
        this.buttons.forEach(button => button.draw(s));
        this.addTitle();
        this.addTip();
        this.addMotionText();
    };

    return homePage;
}

function setupInstructionsPage(s, players) {
    let instructionsPage = new Page('Instructions');

    // Define the positions and sizes for the buttons
    let buttonWidth = 100;
    let buttonHeight = 50;
    let buttonA_X = s.width / 4 - buttonWidth / 2;
    let buttonA_Y = s.height / 2 - buttonHeight / 2;
    let buttonB_X = 3 * s.width / 4 - buttonWidth / 2;
    let buttonB_Y = buttonA_Y;

    // Create buttons for Option A and Option B
    let optionA = new Button(buttonA_X, buttonA_Y, buttonWidth, buttonHeight, 'Option A', true, (playerWhoClicked, x, y) => {
        playerWhoClicked.castVote(x, y);
    });

    let optionB = new Button(buttonB_X, buttonB_Y, buttonWidth, buttonHeight, 'Option B', true, (playerWhoClicked, x, y) => {
        playerWhoClicked.castVote(x, y);
    });

    // Add buttons to the instructions page
    instructionsPage.addButton(optionA);
    instructionsPage.addButton(optionB);

    return instructionsPage;
}

/** ###### CANVAS SETUP ###### **/
const sketch = (s) => {
    s.setup = () => {
        // get the dimensions of the parent HTML element
        let height = document.getElementById('sketch-holder').clientHeight;
        let width = document.getElementById('sketch-holder').clientWidth;

        // create canvas
        let canvas = s.createCanvas(width, height);

        // stretch canvas to fit dimensions of parent
        canvas.parent('sketch-holder');


        // Setup pages
        pages['home'] = setupHomePage(s); // Pass `s` when calling
        pages['instructions'] = setupInstructionsPage(s); // Pass `s` when calling

        // Set "Home" as the default/first page
        setCurrentPage('home');
    };

    s.draw = () => {

        s.background(200); // Example: gray background

        // DEVELOPMENT PURPOSES (Mouse cursor): Update Player 3's position with the mouse position each frame
        const player3 = players[2]; 
        player3.updateWithMouse(s);

        // Draw the current page and its elements
        if (currentPage) {
            currentPage.draw(s);
        }
        
        // Check hover and draw progress for each player
        players.forEach(player => {
            player.checkHover(buttons, s);
            player.drawHoverProgress(s);
            player.drawRipple(s);
            player.drawVote(s);
            player.draw(s);
        });
    };
};

// Create a new p5 instance 
new p5(sketch);
