const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  makeInMemoryStore,
} = require("baileys");
const pino = require("pino");

const { connection_handler } = require("@handlers/connection");
const { update } = require("firebase/database");
const EVENTS = require("@types/events");

const store = makeInMemoryStore({
  logger: pino().child({ level: "silent", stream: "store" }),
});

async function whatsapp(ev, db) {
  const { state, saveCreds } = await useMultiFileAuthState(
    "src/store/whatsapp_keys"
  );
  const sock = makeWASocket({
    printQRInTerminal: true,
    logger: pino({ level: "silent" }),
    auth: state,
    // browser: ["WhatsApp Bot", "Safari", "1.0.0"],
    syncFullHistory: false,
  });

  store.bind(sock.ev);
  sock.ev.on("connection.update", async (update) =>
    await connection_handler(update, sock, whatsapp, ev, db)
  );
  ev.emit('EVENTS.WATSAPP_CONNECTION', {data:"fhaajshjh"})

  // ev.on("request", async (data) => {
  //   console.log(data)
  //   const { type, option, data: number } = JSON.parse(data);
  //   if (type === "request") {
  //     switch (option) {
  //       case "qr":
  //         if (!global.qr) {
  //           ev.emit(EVENTS.WATSAPP_CONNECTION, {
  //             type: "qr",
  //             error: "QR code not found",
  //           });
  //         } else {
  //           ev.emit(EVENTS.WATSAPP_CONNECTION, {
  //             type: "qr",
  //             qr: global.qr,
  //           });
  //         }
  //         break;
  //       case "pairingCode":
  //         const code = await sock.requestPairingCode(number);
  //         if (!code) {
  //           ev.emit(EVENTS.WATSAPP_CONNECTION, {
  //             type: "pairingCode",
  //             error: "Pairing code not found",
  //           });
  //         } else {
  //           ev.emit(EVENTS.WATSAPP_CONNECTION, {
  //             type: "pairingCode",
  //             data: code,
  //           });
  //         }
  //     }
  //   }
  // });
  sock.ev.on("creds.update", saveCreds);
}

module.exports = whatsapp;
