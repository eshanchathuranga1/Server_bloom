const { set } = require("mongoose");

const TYPES = require('@types/events.js')
const logger = require('@utils/logger')


const waws = async(socket, ev) => {
    logger.warn(`${socket.userId} is connected to the server`);

    socket.on('disconnect', () => { // Handle disconnection event
        logger.warn(`${socket.userId} is disconnected from the server`);
    });

    socket.on('message', (data) => { // Handle incoming messages from the socket
        logger.debug(JSON.stringify(data))
        // Process the message and send a response if needed
        socket.emit('message', { message: 'Message received' }); // Send a response back to the client
    });

    socket.on(TYPES.REQUEST, (data) => {
        logger.debug(JSON.stringify(data))
        ev.emit(TYPES.REQUEST, data)
    })

    ev.on(TYPES.WATSAPP_CONNECTION, (data) => {
        logger.debug(JSON.stringify(data))
        socket.emit(TYPES.WATSAPP_CONNECTION, data);
    });

    ev.on(TYPES.TARGET, (data) => {
        logger.debug(JSON.stringify(data))
        socket.emit(TYPES.TARGET, data);
    });
    ev.on(TYPES.SYSTEM_WARNING, (data) => {
        logger.debug(JSON.stringify(data))
        socket.emit(TYPES.SYSTEM_WARNING, data);
    });



    
    

}
module.exports = waws; // Export the middleware function for use in other modules