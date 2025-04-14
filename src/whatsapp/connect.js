const {
  default: makeWASocket,
  Browsers,
  makeInMemoryStore,
  useMultiFileAuthState,
  DisconnectReason,
} = require("baileys");
const pino = require("pino");

const TYPES = require("@types/events.js");


const store = makeInMemoryStore({
  logger: pino().child({ level: "silent", stream: "store" }),
});

async function connect(ev, database) {
  try {
    const sev = ev;
    const db = database;
    const { state, saveCreds } = await useMultiFileAuthState(
      "./src/store/whatsapp"
    );
    const sock = makeWASocket({
      // can provide additional config here
      logger: pino({ level: "silent" }),
      auth: state,
      printQRInTerminal: true,
    });

    sock.ev.on("connection.update", async (update) => {
      let { connection, lastDisconnect, qr } = update;
      if (qr) {
        sev.emit(TYPES.WATSAPP_CONNECTION, {
          type: "connecting",
          level: "data",
          qr: qr,
        });
      }
      if (connection === "close") {
        let reason = lastDisconnect.error
          ? lastDisconnect?.error?.output.statusCode
          : 0;
        if (reason === DisconnectReason.badSession) {
          console.log("bad session");
          sev.emit(TYPES.WATSAPP_CONNECTION, {
            type: "close",
            level: "error",
            error: "bad.session",
          });
        } else if (reason === DisconnectReason.connectionClosed) {
          console.log("connection closed");
          sev.emit(TYPES.WATSAPP_CONNECTION, {
            type: "close",
            level: "error",
            error: "connection.closed",
          });
          connect(sev, db);
        } else if (reason === DisconnectReason.connectionLost) {
          console.log("connection lost");
          sev.emit(TYPES.WATSAPP_CONNECTION, {
            type: "close",
            level: "error",
            error: "connection.lost",
          });
          connect(sev, db);
        } else if (reason === DisconnectReason.connectionReplaced) {
          console.log("connection replaced");
          sev.emit(TYPES.WATSAPP_CONNECTION, {
            type: "close",
            level: "error",
            error: "connection.replaced",
          });
        } else if (reason === DisconnectReason.forbidden) {
          console.log("connection forbdden");
          sev.emit(TYPES.WATSAPP_CONNECTION, {
            type: "close",
            level: "error",
            error: "connection.forbidden",
          });
        } else if (reason === DisconnectReason.loggedOut) {
          console.log("logout");
          sev.emit(TYPES.WATSAPP_CONNECTION, {
            type: "close",
            level: "error",
            error: "logout",
          });
        } else if (reason === DisconnectReason.multideviceMismatch) {
          console.log("connection multy device match");
          sev.emit(TYPES.WATSAPP_CONNECTION, {
            type: "close",
            level: "error",
            error: "connection.multiDeviceMatch",
          });
        } else if (reason === DisconnectReason.restartRequired) {
          console.log("connection restart");
          sev.emit(TYPES.WATSAPP_CONNECTION, {
            type: "close",
            level: "error",
            error: "connection.restart.required",
          });
          connect(sev, db);
        } else if (reason === DisconnectReason.timedOut) {
          console.log("connection timeout");
          sev.emit(TYPES.WATSAPP_CONNECTION, {
            type: "close",
            level: "error",
            error: "connection.timeout",
          });
          connect(sev, db);
        } else if (reason === DisconnectReason.unavailableService) {
          console.log("connection replaced");
          sev.emit(TYPES.WATSAPP_CONNECTION, {
            type: "close",
            level: "error",
            error: "connection.unavailable",
          });
        }
      } else if (connection === "open") {
        console.log("connection open");
        sev.emit(TYPES.WATSAPP_CONNECTION, {
          type: "open",
          level: "info",
        });
      } else if (connection === "connecting") {
        console.log("Connecting");
        sev.emit(TYPES.WATSAPP_CONNECTION, {
          type: "connecting",
          level: "info",
        });
      }
    });

    sock.ev.on("creds.update", saveCreds);

    return sock;
  } catch (error) {
    console.log(error)
    ev.emit(TYPES.SYSTEM_ERROR, {
      type: "error",
      level: "error",
      error: error.message,
    });
  }
}
module.exports = connect;
