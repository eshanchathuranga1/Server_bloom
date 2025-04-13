const {
  default: makeWASocket,
  makeInMemoryStore,
  useMultiFileAuthState,
  DisconnectReason,
} = require("baileys");
const { pino, levels } = require("pino");
const TYPES = require("@types/events");
const path = require("path");
const fs = require("fs");


module.exports = async (update, sock, connect, sev, db) => {
  try {
    
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      sev.emit(TYPES.WATSAPP_CONNECTION, {
        type: "connection",
        option: "qr",
        level: "data",
        qr: qr,
      });
    }
    if (connection === "close") {
      let reason = lastDisconnect.error
        ? lastDisconnect?.error?.output.statusCode
        : 0;
      if (reason === DisconnectReason.badSession) {
        res({
          type: "close",
          levels: "error",
          reason: "bas.session",
          restartRequired: false,
        });
        await deleteSessions();
      } else if (reason === DisconnectReason.connectionClosed) {
        res({
          type: "close",
          levels: "error",
          reason: "connectionClosed",
          restartRequired: true
        });
        // Let baileys handle reconnection automatically
      } else if (reason === DisconnectReason.connectionLost) {
        res({
          type: "close",
          levels: "error",
          reason: "connectionLost",
          restartRequired: true
        });
        // Let baileys handle reconnection automatically
      } else if (reason === DisconnectReason.connectionReplaced) {
        res({
          type: "close",
          levels: "error",
          reason: "connectionReplaced",
          restartRequired: false,
        });
        await deleteSessions();
      } else if (reason === DisconnectReason.forbidden) {
        res({
          type: "close",
          levels: "error",
          reason: "forbidden",
          restartRequired: false,
        });
        await deleteSessions();
      } else if (reason === DisconnectReason.loggedOut) {
        res({
          type: "close",
          levels: "error",
          reason: "loggedOut",
          restartRequired: false,
        });
        await deleteSessions();
      } else if (reason === DisconnectReason.multideviceMismatch) {
        res({
          type: "close",
          levels: "error",
          reason: "multideviceMismatch",
          restartRequired: false,
        });
        await deleteSessions();
      } else if (reason === DisconnectReason.restartRequired) {
        res({
          type: "close",
          levels: "error",
          reason: "restartRequired",
          restartRequired: true
        });
        // Let baileys handle reconnection automatically
      } else if (reason === DisconnectReason.timedOut) {
        res({
          type: "close",
          levels: "error",
          reason: "timedOut",
          restartRequired: true
        });
        // Let baileys handle reconnection automatically
      } else if (reason === DisconnectReason.unavailableService) {
        res({
          type: "close",
          levels: "error",
          reason: "unavailableService",
          restartRequired: true
        });
        // Let baileys handle reconnection automatically
      }

      async function res(data) {
        sev.emit(TYPES.WATSAPP_CONNECTION, data);
      }
      async function deleteSessions(params) {
        // Delete /store/whatsapp
        const dir = path.join(__dirname, "..", "..", "store", "whatsapp");
        try {
          fs.rmdirSync(dir, { recursive: true });
        } catch (error) {
          throw error;
        }
      }
    } else if (connection === "open") {
      res({
        type: "open",
        levels: "info",
      });
    } else if (connection === "connecting") {
      res({
        type: "connecting",
        levels: "info",
      });
    }

    



  } catch (error) {
    console.log(error);
    sev.emit(TYPES.SYSTEM_ERROR, {
      type: "error",
      level: "error",
      error: error,
      path: path.basename(__filename),
    });
  }

  
};
