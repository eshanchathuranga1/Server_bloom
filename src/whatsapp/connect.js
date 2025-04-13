const {
  default: makeWASocket,
  makeInMemoryStore,
  useMultiFileAuthState,
  DisconnectReason,
} = require("baileys");
const { default: pino } = require("pino");

const TYPES = require("@types/events");

const connectionHandler = require("./handlers/connection_handler");
const store = makeInMemoryStore({
  logger: pino().child({ level: "silent", stream: "store" }),
});

async function connect(sev, db) {
  if (!sev || typeof sev.emit !== "function") {
    throw new Error("Invalid EventEmitter passed to WhatsApp connect function");
  }

  try {
    const { state, saveCreds } = await useMultiFileAuthState(
      "./src/store/whatsapp"
    );
    const sock = makeWASocket({
      // can provide additional config here
      logger: pino({ level: "silent" }),
      auth: state,
      printQRInTerminal: true,
    });
    sock.ev.on("connection.update", (update) => {
      connectionHandler(update, sock,  sev, db);
      sev.on(TYPES.WATSAPP_CONNECTION, (data) => {
        let {type, restartRequired} = data;
        if (type === 'close') {
          if (restartRequired) {
            connect(sev, db);
          }
        }
      });
    });

    sock.ev.on("creds.update", saveCreds);
  } catch (error) {
    throw error;
  }
}

module.exports = connect;
