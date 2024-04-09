class Button {
    constructor(x, y, width, height, label, activityMatters, onClick) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.label = label;
        this.onClick = onClick; // Function to call when the button is 'pressed'
        this.activityMatters = false;
    }

    // Check if a given point (e.g., a wrist position) is inside the button
    isInside(x, y) {
        return x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height;
    }

    // Draw the button on the canvas
    draw(s) {
        s.noStroke();
        s.fill(255); // Button color
        s.rect(this.x, this.y, this.width, this.height, 5); // Rounded corners
        s.fill(0); // Text color
        s.textAlign(s.CENTER, s.CENTER);
        s.text(this.label, this.x + this.width / 2, this.y + this.height / 2);
    }
}


export { Button };