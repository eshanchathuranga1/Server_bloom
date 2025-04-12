const { DisconnectReason } = require('baileys')
const fs = require('fs')
const whatsapp = require('../connect')

module.exports = {
    connection: async (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            module.exports.qr(qr)
        }
        if (connection === 'open') {
            module.exports.reasonOpen()
        } else if (connection === 'close') {
            module.exports.reasonClose(lastDisconnect)
        } else if (connection === 'connecting') {
            module.exports.reasonConnecting()
        }
        
        
            
    },
    reasonClose: async (lastDisconnect) => {
        let reason = lastDisconnect.error ? lastDisconnect?.error?.output?.statusCode : 0;
        const socket = global.socket; // Access the socket instance from the global scope
        if (reason === DisconnectReason.badSession) {
            console.log({
                type: 'badSession',
                message: 'Bad session file, please delete session and scan again'
            })
            // Send a message to the client if connected via socket
            module.exports.next({
                type: 'badSession',
                message: 'Bad session file, please delete session and scan again'
            });
            // Delete the session file
            try {
                await fs.unlinkSync('src/store/whatsapp_auth')
                console.log('Session file deleted')
            } catch (error) {
                console.error('Error deleting session file:', error)
                module.exports.next({
                    type: 'error',
                    message: 'Error deleting session file'
                });
            }
            global.whatsapp(); // Restart the whatsapp connection
        } else if (reason === DisconnectReason.connectionClosed) {
            console.log('Connection closed, reconnecting...')
            module.exports.next({
                type: 'connectionClosed',
                message: 'Connection closed, reconnecting...'
            });
            global.whatsapp(); // Restart the whatsapp connection
        } else if (reason === DisconnectReason.connectionLost) {
            console.log('Connection lost, reconnecting...')
            module.exports.next({
                type: 'connectionLost',
                message: 'Connection lost, reconnecting...'
            });
            global.whatsapp(); // Restart the whatsapp connection
        }
        else if (reason === DisconnectReason.connectionReplaced) {
            console.log('Connection replaced, please close current session')
            module.exports.next({
                type: 'connectionReplaced',
                message: 'Connection replaced, please close current session'
            });
            // Delete the session file
            try {
                await fs.unlinkSync('src/store/whatsapp_auth')
                console.log('Session file deleted')
            }
            catch (error) {
                console.error('Error deleting session file:', error)
                module.exports.next({
                    type: 'error',
                    message: 'Error deleting session file'
                });
            }
            global.whatsapp(); // Restart the whatsapp connection
        } else if (reason === DisconnectReason.loggedOut) {
            console.log('Logged out, please scan again')
            module.exports.next({
                type: 'loggedOut',
                message: 'Logged out, please scan again'
            });
            // Delete the session file
            try {
                await fs.unlinkSync('src/store/whatsapp_auth')
                console.log('Session file deleted')
            } catch (error) {
                console.error('Error deleting session file:', error)
                module.exports.next({
                    type: 'error',
                    message: 'Error deleting session file'
                });
            }
            global.whatsapp(); // Restart the whatsapp connection
        } else if (reason === DisconnectReason.restartRequired) {
            console.log('Restart required, restarting...')
            module.exports.next({
                type: 'restartRequired',
                message: 'Restart required, restarting...'
            });
            global.whatsapp(); // Restart the whatsapp connection
        } else if (reason === DisconnectReason.timedOut) {
            console.log('Timed out, reconnecting...')
            module.exports.next({
                type: 'timedOut',
                message: 'Timed out, reconnecting...'
            });
            global.whatsapp(); // Restart the whatsapp connection
        } else {
            console.log('Unknown disconnect reason:', reason)
            module.exports.next({
                type: 'unknown',
                message: 'Unknown disconnect reason'
            });
            global.whatsapp(); // Restart the whatsapp connection
        }
    },
    reasonOpen: async () => {
        console.log('WhatsApp Web connected successfully')
        module.exports.next({
            type: 'open',
            message: 'WhatsApp Web connected successfully'
        });
    },
    reasonConnecting: async () => {
        console.log('Connecting to WhatsApp Web...')
        module.exports.next({
            type: 'connecting',
            message: 'Connecting to WhatsApp Web...'
        });
    },
    qr: async function (qr) {
        console.log('QR Code received:', qr)
        global.qr = qr; // Store the QR code in a global variable
        this.next({
            type: 'qr',
            message: 'QR Code received',
            data: qr
        });
    },
    next: async (data) => {
        const ev = global.ev;
        ev.emit('code', data);
    }
}