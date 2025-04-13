const {
    default: makeWASocket,
    makeInMemoryStore,
    useMultiFileAuthState,
    DisconnectReason,
  } = require("baileys");
  const { pino } = require("pino");
  const TYPES = require("@types/events")


module.exports = (update, sock, connect, sev, db) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
        ev.emit(TYPES.WATSAPP_CONNECTION, {
            type:'connection',
            option: "qr",
            level: "data",
            qr: qr
        });
    }
    if (connection === "close") {
        
    }
}