const {
  default: makeWASocket,
  useSingleFileAuthState,
  DisconnectReason,
  makeInMemoryStore,
} = require("baileys");
const EVENTS = require("@types/events");
const path = require("path");
const fs = require("fs");

const connect = {
  connection_handler: async function (update, sock, whatsapp, ev, db) {
    console.log(ev)
    try {
      let { connection, lastDisconnect, qr } = update;
      if (qr) {
        connect.conn_qr(qr, ev);
      }
      if (connection === "close") {
        connect.conn_closed(lastDisconnect, whatsapp, ev, db);
      } else if (connection === "open") {
        connect.conn_open(sock, ev);
      } else if (connection === "connecting") {
        connect.conn_connecting(ev);
      }
    } catch (error) {
      console.error("Error in connection:", error);
      ev.emit(EVENTS.SYS_ERROR, {
        error: error.message,
        path: path.basename(__filename),
        method: "connection_handler",
        data: update,
      });
    }
  },
  conn_closed: async function (lastDisconnect, whatsapp, ev, db) {
    let reason = lastDisconnect.error
      ? lastDisconnect?.error?.output.statusCode
      : 0;
    if (reason === DisconnectReason.badSession) {
      [EVENTS.WATSAPP_CONNECTION, EVENTS.SYS_ERROR].forEach((event) => {
        ev.emit(event, {
          type: "closed",
          level: "error",
          reason: "bad.session",
        });
      });
      // Deleting session file
      connect.deleteSession(ev, db);
    } else if (DisconnectReason.connectionClosed) {
      [EVENTS.WATSAPP_CONNECTION, EVENTS.SYS_ERROR].forEach((event) => {
        ev.emit(event, {
          type: "closed",
          level: "error",
          reason: "connection.closed",
        });
      });
      whatsapp();
    } else if (DisconnectReason.connectionLost) {
      [EVENTS.WATSAPP_CONNECTION, EVENTS.SYS_ERROR].forEach((event) => {
        ev.emit(event, {
          type: "closed",
          level: "error",
          reason: "connection.lost",
        });
      });
      whatsapp();
    } else if (DisconnectReason.connectionReplaced) {
      [EVENTS.WATSAPP_CONNECTION, EVENTS.SYS_ERROR].forEach((event) => {
        ev.emit(event, {
          type: "closed",
          level: "error",
          reason: "connection.replaced",
        });
      });
      // Deleting session file
      connect.deleteSession(ev, db);
    } else if (DisconnectReason.forbidden) {
      [EVENTS.WATSAPP_CONNECTION, EVENTS.SYS_ERROR].forEach((event) => {
        ev.emit(event, {
          type: "closed",
          level: "error",
          reason: "connection.forbidden",
        });
      });
      // Deleting session file
      connect.deleteSession(ev, db);
    } else if (reason === DisconnectReason.loggedOut) {
      [EVENTS.WATSAPP_CONNECTION, EVENTS.SYS_ERROR].forEach((event) => {
        ev.emit(event, {
          type: "closed",
          level: "error",
          reason: "connection.logout",
        });
      });
      // Deleting session file
      connect.deleteSession(ev, db);
    } else if (DisconnectReason.multideviceMismatch) {
      [EVENTS.WATSAPP_CONNECTION, EVENTS.SYS_ERROR].forEach((event) => {
        ev.emit(event, {
          type: "closed",
          level: "error",
          reason: "connection.multideviceMismatch",
        });
      });
      // Deleting session file
      connect.deleteSession(ev, db);
    } else if (DisconnectReason.restartRequired) {
      [EVENTS.WATSAPP_CONNECTION, EVENTS.SYS_ERROR].forEach((event) => {
        ev.emit(event, {
          type: "closed",
          level: "error",
          reason: "connection.restart",
        });
      });
      whatsapp();
    } else if (DisconnectReason.timedOut) {
      [EVENTS.WATSAPP_CONNECTION, EVENTS.SYS_ERROR].forEach((event) => {
        ev.emit(event, {
          type: "closed",
          level: "error",
          reason: "connection.timedOut",
        });
      });
      whatsapp();
    } else if (DisconnectReason.unavailableService) {
      [EVENTS.WATSAPP_CONNECTION, EVENTS.SYS_ERROR].forEach((event) => {
        ev.emit(event, {
          type: "closed",
          level: "error",
          reason: "connection.unavailableService",
        });
      });
      whatsapp();
    }
  },
  conn_open: async (sock, ev) => {
    await sock
      .updateProfileName("bot")
      [(EVENTS.WATSAPP_CONNECTION, EVENTS.SYS_ERROR)].forEach((event) => {
        ev.emit(event, {
          type: "open",
          level: "info",
        });
      });
  },
  conn_connecting: (ev) => {
    // ev.emit(EVENTS.WATSAPP_CONNECTION, {
    //   type: "connecting",
    //   level: "info",
    // });
    console.log("connecting")
  },
  conn_qr: (qr, ev) => {
    global.qr = qr;
    ev.emit(EVENTS.WATSAPP_CONNECTION, {
      type: "qr",
      level: "data",
      data: qr,
    });
  },
  deleteSession: async (ev, db) => {
    // Deleting session file
    try {
      const sessionPath = path.join(__dirname, "src", "store", "whatsapp_keys");
      fs.unlinkSync(sessionPath);
      db.update("configurations/whatsapp/connections", {
        isLoggedIn: false,
        account: { name: null, number: null },
      });
    } catch (error) {
      ev.emit(EVENTS.SYS_ERROR, {
        type: "error",
        level: "error",
        reason: "Error deleting session file",
        error: error,
      });
    }
  },
};

module.exports = connect;
