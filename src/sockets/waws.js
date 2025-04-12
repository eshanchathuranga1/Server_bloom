const { set } = require("mongoose");

const waws = async(socket) => {
    console.log('WAWs socket connected', socket.userId); // Log the connection event

    socket.on('disconnect', () => { // Handle disconnection event
        console.log('WAWs socket disconnected', socket.userId); // Log the disconnection event
        global.store.remove(socket.userId); // Remove the user data from the store on disconnection
    });

    socket.on('message', (data) => { // Handle incoming messages from the socket
        console.log('Received message:', data); // Log the received message
        // Process the message and send a response if needed
        socket.emit('message', { message: 'Message received' }); // Send a response back to the client
    });

    const ev = global.ev; // Access the global event emitter
    ev.on('code', (data) => { // Listen for 'next' events
        socket.emit('whatsapp', data); // Emit the event to the socket client
    });

    socket.on('reqwa', (data) => {
        console.log('Send to ev:', data); // Log the received event
        ev.emit('whatsapp', data); // Emit the event to the socket client
    });

    

    
    

}
module.exports = waws; // Export the middleware function for use in other modules