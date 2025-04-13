const { set } = require("mongoose");

const TYPES = require('@types/events.js')


const connectWhatsApp = require('@whatsapp/connect');

const waws = async(socket, ev) => {
    if (!ev || typeof ev.emit !== 'function') {
        throw new Error('Invalid EventEmitter passed to WAWs socket');
    }

    console.log('WAWs socket connected', socket.userId);

    // Initialize WhatsApp connection with the socket's EventEmitter
    try {
        await connectWhatsApp(ev, null); // Pass ev as sev parameter
    } catch (error) {
        console.error('WhatsApp connection failed:', error);
        socket.emit(TYPES.SYSTEM_ERROR, {
            type: 'error',
            level: 'error',
            error: error.message
        });
    }

    socket.on('disconnect', () => {
        console.log('WAWs socket disconnected', socket.userId);
    });

    socket.on('message', (data) => {
        console.log('Received message:', data);
        socket.emit('message', { message: 'Message received' });
    });

    ev.on(TYPES.WATSAPP_CONNECTION, (data) => {
        console.log('WATSAPP_CONNECTION', data);
        socket.emit(TYPES.WATSAPP_CONNECTION, data);
    });

    
    

}
module.exports = waws; // Export the middleware function for use in other modules