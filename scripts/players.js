
class Player {
    // New properties for the ripple effect
    rippleActive = false;
    rippleStartTime = 0;
    finalRippleSize = 50; // Maximum size of the ripple
    rippleDuration = 500; // Duration of the ripple effect in milliseconds

    constructor(id) {
        this.id = id;
        this.leftWrist = { x: 0, y: 0, valid: false, active: true, hoverStartTime: null };
        this.rightWrist = { x: 0, y: 0, valid: false, active: true, hoverStartTime: null };
        this.hoveredButton = null; // Tracks the currently hovered button
        this.hasVoted = false;
        this.votePosition = null;
    }

    updateJoints(joints) {
        const leftWrist = joints.find(joint => joint.id === WRIST_LEFT_INDEX);
        const rightWrist = joints.find(joint => joint.id === WRIST_RIGHT_INDEX);

        if (leftWrist && leftWrist.valid) {
            this.leftWrist = { ...leftWrist.position, valid: true };
        } else {
            this.leftWrist.valid = false;
        }

        if (rightWrist && rightWrist.valid) {
            this.rightWrist = { ...rightWrist.position, valid: true };
        } else {
            this.rightWrist.valid = false;
        }
    }
    // Call this method when the player casts a vote
    castVote(x, y) {
        if (!this.hasVoted) {
            this.hasVoted = true;
            this.votePosition = { x, y };
            this.leftWrist.active = false;  // Assuming the left wrist is used for voting
            this.rightWrist.active = false;  // Assuming the left wrist is used for voting
        }
    }

    drawVote(s) {
        if (this.hasVoted && this.votePosition) {
            s.fill(0, 0, 255); // Blue color for the vote, change as needed
            s.noStroke();
            s.ellipse(this.votePosition.x, this.votePosition.y, 20); // Draw a circle at the vote position
        }
    }

    reactivateCursors(){
        this.leftWrist.active = true;  // Assuming the left wrist is used for voting
        this.rightWrist.active = true;  // Assuming the left wrist is used for voting
    }

    // Development only method for updating Player 3's left wrist with mouse positions
    updateWithMouse(s) {
        if (!this.leftWrist || this.leftWrist === null || typeof this.leftWrist === 'undefined') {
            // Initialize leftWrist if it's not already
            this.leftWrist = { x: s.mouseX, y: s.mouseY, valid: true, hoverStartTime: null };
        } else {
            // Only update the x and y values, and valid status
            this.leftWrist.x = s.mouseX;
            this.leftWrist.y = s.mouseY;
            this.leftWrist.valid = true;
        }
    }


    // Check for hover over a button and update hover state
    checkHover(buttons, s) {

        // Check each wrist against each button
        [this.leftWrist, this.rightWrist].forEach(wrist => {

            if (wrist.valid) {
                buttons.forEach(button => {

                    let isActive = button.activityMatters ? wrist.active : true;

                    if (button.isInside(wrist.x, wrist.y) && isActive) {
                        if(button !== this.hoveredButton){
                            s.millis()
                            this.hoveredButton = button;
                            wrist.hoverStartTime = s.millis(); // p5.js function for current time in ms
                        }
                    } else {
                        if(button === this.hoveredButton){
                            this.hoveredButton = null;
                            wrist.hoverStartTime = null;
                        }
                    }
                });
            }
            
        });
    }

    // Method to start the ripple effect
    startRipple(s) { 
        this.rippleActive = true;
        this.rippleStartTime = s.millis(); // Record the start time of the ripple
    }

    // Method to draw the ripple effect
    drawRipple(s) {
        if (this.rippleActive) {
            let currentTime = s.millis();
            let elapsedTime = currentTime - this.rippleStartTime;
            let progress = elapsedTime / this.rippleDuration;

            // Check if the ripple effect should still be active
            if (progress >= 1) {
                this.rippleActive = false;
            } else {
                // Calculate the current size of the ripple with ease-out effect
                // Using "ease-out" quadratic: progress * (2 - progress)
                let easedProgress = progress * (2 - progress);
                let currentRippleSize = easedProgress * this.finalRippleSize;

                // Calculate the opacity to fade out the ripple
                // Fades out more quickly: (1 - progress)^2
                let opacity = (1 - progress) * (1 - progress) * 255;

                // Draw the ripple
                s.noStroke();
                s.fill(10, 10, 10, opacity);
                s.ellipse(this.leftWrist.x, this.leftWrist.y, currentRippleSize * 2);
            }
        }
    }

    // Draw hover progress circle for each wrist
    drawHoverProgress(s) {

        const cursorRadius = 10; // Final size matching the cursor
        const initialRadius = 50; // Starting size of the progress circle

        [this.leftWrist, this.rightWrist].forEach(wrist => {
            
            if (wrist.valid && wrist.hoverStartTime !== undefined && wrist.hoverStartTime !== null) {
                let hoverDuration = s.millis() - wrist.hoverStartTime;
                let progress = hoverDuration / 1200; // 2 seconds to full circle
                let easedProgress = progress * progress; // Quadratic easing (ease-in)
                
                // Calculate eased radius
                let easedRadius = initialRadius + (cursorRadius - initialRadius) * easedProgress;

                // Interpolate alpha value from 0 (transparent) to 255 (opaque) based on easedProgress
                let alpha = s.lerp(0, 255, easedProgress);
    
                if (progress >= 1) {
                    this.hoveredButton?.onClick(this, wrist.x, wrist.y); // Ensure hoveredButton is not null before calling onClick
                    this.hoveredButton
                    wrist.hoverStartTime = null; // Reset to start over after clicking
                    this.startRipple(s); // Start the ripple effect
                } else {
                    // Draw progress circle with easing and interpolated radius
                    s.noFill();
                    s.stroke(30, 30, 30, alpha); // Adjust RGB values as needed
                    s.strokeWeight(2);
                    let angle = s.TWO_PI * easedProgress;
                    s.arc(wrist.x, wrist.y, easedRadius * 2, easedRadius * 2, -s.HALF_PI, -s.HALF_PI + s.TWO_PI);
                }
            }
        });
    }


    cursorSize = 30;

    draw(s) {
        // Draw left wrist cursor if valid
        if (this.leftWrist.valid) {

            let active = this.leftWrist.active;

            if(active){
                s.fill('red');
            }else {
                s.fill(20, 20, 20, 127);
            }

            s.ellipse(this.leftWrist.x, this.leftWrist.y, this.cursorSize);
            
            if(active){
                s.fill('white');
            }else {
                s.fill (0, 0, 0, 127)
            }

            s.text(`P${this.id}L`, this.leftWrist.x, this.leftWrist.y);
        }

        // Draw right wrist cursor if valid
        if (this.rightWrist.valid) {
            if(this.leftWrist.active){
                s.fill('red');
            }else {
                s.fill(20, 20, 20, 127);
            }
            s.ellipse(this.rightWrist.x, this.rightWrist.y, this.cursorSize);
            s.fill('white');
            s.text(`P${this.id}R`, this.rightWrist.x, this.rightWrist.y);
        }
    }
}

export { Player };