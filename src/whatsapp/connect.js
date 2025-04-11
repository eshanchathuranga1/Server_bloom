const { default: makeWASocket, makeInMemoryStore, useMultiFileAuthState, DisconnectReason } = require('baileys')

const store = makeInMemoryStore({ logger: console })