// page.js

class Page {
    constructor(name) {
        this.name = name;
        this.elements = []; // Could include text fields, etc.
        this.buttons = [];
    }

    addButton(button) {
        this.buttons.push(button);
        this.elements.push(button); // Assuming buttons are also considered elements
    }

    addNewElement(element) {
        this.elements.push(element); 
    }

    draw(s) {
        // Draw all page elements, including buttons
        this.elements.forEach(element => {
            if (typeof element.draw === 'function') {
                element.draw(s);
            }
        });
    }

}

export { Page };

