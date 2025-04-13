const {
  default: makeWASocket,
  makeInMemoryStore,
  useMultiFileAuthState,
  DisconnectReason,
} = require("baileys");
const { default: pino } = require("pino");


const connectionHandler = require('./handlers/connection_handler')
const store = makeInMemoryStore({
  logger: pino().child({ level: "silent", stream: "store" }),
});

async function connect(ev, db) {
  const { state, saveCreds } = await useMultiFileAuthState("./src/store/whatsapp");
  const sock = makeWASocket({
    // can provide additional config here
    logger:pino({level:'silent'}),
    auth: state,
    printQRInTerminal: true,
  });
  sock.ev.on('connection.update', (update) => connectionHandler(update, sock, connect, ev, db));

  sock.ev.on('creds.update', saveCreds)

}

module.exports = connect;
