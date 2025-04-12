const { default: makeWASocket, makeInMemoryStore, useMultiFileAuthState, DisconnectReason } = require('baileys')
const pino = require('pino')

const { connection } = require('@handlers/conection_handler') // Import the disconnect handler

const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) })

async function whatsapp() {
    const { state, saveCreds } = await useMultiFileAuthState('src/store/whatsapp_auth') // Load authentication state from the specified directory
    const sock = makeWASocket({
        printQRInTerminal: true,
        logger: pino({ level: 'silent' }),
        auth: state,
        browser: ['MyApp', 'Safari', '1.0.0']
    });

    store.bind(sock.ev);

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', connection) // Handle connection updates;


    global.ev.on('whatsapp', async function (data) {
        const { option, number} = JSON.parse(data); // Parse the received data
        console.log('Send to whatsapp:', data); // Log the received event
        const code = await sock.requestPairingCode(number); // Request pairing code from WhatsApp
        console.log('Pairing code:', code); // Log the pairing code
        global.ev.emit('code', { option, data: code }); // Emit the pairing code to the socket client

    });

    return sock
}
global.whatsapp = whatsapp // Assign the whatsapp function to a global 
module.exports = whatsapp;