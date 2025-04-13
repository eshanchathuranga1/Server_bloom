const { set } = require("mongoose");

const TYPES = require('@types/events.js')


const waws = async(socket, ev) => {
    console.log('WAWs socket connected', socket.userId); // Log the connection event

    socket.on('disconnect', () => { // Handle disconnection event
        console.log('WAWs socket disconnected', socket.userId); // Log the disconnection event
    });

    socket.on('message', (data) => { // Handle incoming messages from the socket
        console.log('Received message:', data); // Log the received message
        // Process the message and send a response if needed
        socket.emit('message', { message: 'Message received' }); // Send a response back to the client
    });

    ev.on(TYPES.WATSAPP_CONNECTION, (data) => {
        console.log('WATSAPP_CONNECTION', data);
        socket.emit(TYPES.WATSAPP_CONNECTION, data);
    });

    
    

}
module.exports = waws; // Export the middleware function for use in other modules