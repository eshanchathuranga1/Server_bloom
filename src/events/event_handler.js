const EventEmitter = require('events');

const ev = new EventEmitter(); // Create a global event emitter instance
ev.setMaxListeners(0); // Set the maximum number of listeners to unlimited

// Event handler for socket connection
ev.on('connection', (socket) => {
    
});

// 
