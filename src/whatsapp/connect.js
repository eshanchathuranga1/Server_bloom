const {
  default: makeWASocket,
  Browsers,
  makeInMemoryStore,
  useMultiFileAuthState,
  DisconnectReason,
} = require("baileys");
const pino = require("pino");
const path = require("path");
const fs = require('fs-extra');

const TYPES = require("@types/events.js");
const logger = require('@utils/logger');



const store = makeInMemoryStore({
  logger: pino().child({ level: "silent", stream: "store" }),
});

async function connect(ev, database) {
  try {
    const sev = ev;
    const db = database;
    var config = null
    db.isUpdate('configurations', ev, async(data) => { 
        logger.ok("Config updated")
        config = data 
    });   
    const { state, saveCreds } = await useMultiFileAuthState(
      "./src/store/whatsapp"
    );
    const sock = makeWASocket({
      // can provide additional config here
      logger: pino({ level: "error" }),
      auth: state,
      printQRInTerminal: true,
      markOnlineOnConnect: false,
      syncFullHistory: true,
    });

    sock.ev.on("connection.update", async (update) => {
      let { connection, lastDisconnect, qr } = update;
        async function deleteSession(){
            // delete src/store/whatsapp file
            const dir = path.join(__dirname, "..", "store", "whatsapp");
            try {
                await fs.remove(dir);
                logger.success("Whatsapp auth files deleted");
              } catch (err) {
                logger.show(err);
                    logger.error("Error occurred when deleting Whatsapp auth ailes");
              }
        }

      if (qr) {
        logger.info("QR Code Genatated")
        logger.show(qr)
        sev.emit(TYPES.WATSAPP_CONNECTION, {
          type: "qr",
          level: "data",
          qr: qr,
        });
        db.update({path:'configurations/whatsapp/connections/auth', data:{qr:qr}}, data => {
            if(!data.status === "success") {logger.error('Cannot Update Whatsapp Auth Configurations')}
            logger.success("Whatsapp Auth Configurations Updated Successfully")
        })
      }
      if (connection === "close") {
        let reason = lastDisconnect.error
          ? lastDisconnect?.error?.output.statusCode
          : 0;
        if (reason === DisconnectReason.badSession) {
          logger.error("Bad Session Files Detected")
          sev.emit(TYPES.WATSAPP_CONNECTION, {
            type: "close",
            level: "error",
            error: "bad.session",
          });
          // delete session files
          try {
            deleteSession();
            db.update({
                path: 'configurations/whatsapp/connections/login',
                data:{islogedin:false}
            }, data => {
                if(!data.status === "success") {logger.error('Cannot Update Whatsapp Auth Configations')}
                logger.success("Successfully Updated Whatsapp Auth Configations")
            });
          } catch (error) {
            throw error
          }
        } else if (reason === DisconnectReason.connectionClosed) {
          logger.error("Whatsapp connection closed")
          sev.emit(TYPES.WATSAPP_CONNECTION, {
            type: "close",
            level: "error",
            error: "connection.closed",
          });
          connect(sev, db);
        } else if (reason === DisconnectReason.connectionLost) {
            logger.error("Connection lost from Whatsapp")
          sev.emit(TYPES.WATSAPP_CONNECTION, {
            type: "close",
            level: "error",
            error: "connection.lost",
          });
          connect(sev, db);
        } else if (reason === DisconnectReason.connectionReplaced) {
            logger.error("Whatsapp connection replaced");
          sev.emit(TYPES.WATSAPP_CONNECTION, {
            type: "close",
            level: "error",
            error: "connection.replaced",
          });
          // delete session files
          try {
            deleteSession();
            db.update({
                path: 'configurations/whatsapp/connections/login',
                data:{islogedin:false}
            }, data => {
                if(!data.status === "success") {logger.error('Cannot Update Whatsapp Auth Configations')}
                logger.success("Successfully Updated Whatsapp Auth Configations")
            });
          } catch (error) {
            throw error
          }
        } else if (reason === DisconnectReason.forbidden) {
            logger.error("Whatsapp connection forbidden");
          sev.emit(TYPES.WATSAPP_CONNECTION, {
            type: "close",
            level: "error",
            error: "connection.forbidden",
          });
          // delete session files
          try {
            deleteSession();
            db.update({
                path: 'configurations/whatsapp/connections/login',
                data:{islogedin:false}
            }, data => {
                if(!data.status === "success") {logger.error('Cannot Update Whatsapp Auth Configations')}
                logger.success("Successfully Updated Whatsapp Auth Configations")
            });
          } catch (error) {
            throw error
          }
        } else if (reason === DisconnectReason.loggedOut) {
            logger.error("Whatstapp account logout")
          sev.emit(TYPES.WATSAPP_CONNECTION, {
            type: "close",
            level: "error",
            error: "logout",
          });
          // delete session files
          try {
            deleteSession();
            db.update({
                path: 'configurations/whatsapp/connections/login',
                data:{islogedin:false}
            }, data => {
                if(!data.status === "success") {logger.error('Cannot Update Whatsapp Auth Configations')}
                logger.success("Successfully Updated Whatsapp Auth Configations")
            });
          } catch (error) {
            throw error
          }
        } else if (reason === DisconnectReason.multideviceMismatch) {
            logger.error("Whatsapp multi device mismatch");
          sev.emit(TYPES.WATSAPP_CONNECTION, {
            type: "close",
            level: "error",
            error: "connection.multiDeviceMatch",
          });
          // delete session files
          try {
            deleteSession();
            db.update({
                path: 'configurations/whatsapp/connections/login',
                data:{islogedin:false}
            }, data => {
                if(!data.status === "success") {logger.error('Cannot Update Whatsapp Auth Configations')}
                logger.success("Successfully Updated Whatsapp Auth Configations")
            });
          } catch (error) {
            throw error
          }
        } else if (reason === DisconnectReason.restartRequired) {
            logger.error("Whatsapp connection restart required");
          sev.emit(TYPES.WATSAPP_CONNECTION, {
            type: "close",
            level: "error",
            error: "connection.restart.required",
          });
          connect(sev, db);
        } else if (reason === DisconnectReason.timedOut) {
            logger.error("Whatsapp connection time out")
          sev.emit(TYPES.WATSAPP_CONNECTION, {
            type: "close",
            level: "error",
            error: "connection.timeout",
          });
          connect(sev, db);
        } else if (reason === DisconnectReason.unavailableService) {
            logger.error("Whatsapp connection unavailable")
          sev.emit(TYPES.WATSAPP_CONNECTION, {
            type: "close",
            level: "error",
            error: "connection.unavailable",
          });
          // delete session files
          try {
            deleteSession();
            db.update({
                path: 'configurations/whatsapp/connections/login',
                data:{islogedin:false}
            }, data => {
                if(!data.status === "success") {logger.error('Cannot Update Whatsapp Auth Configations')}
                logger.success("Successfully Updated Whatsapp Auth Configations")
            });
          } catch (error) {
            throw error
          }
        }
      } else if (connection === "open") {
        logger.success('Whatsapp API Connected')
        sev.emit(TYPES.WATSAPP_CONNECTION, {
          type: "open",
          level: "info",
        });
        await db.update({path:'configurations/whatsapp/connections/login', data:{islogedin:true}}, async (data) =>{
            if(!data.status === 'success'){logger.warning('Cannot Update Whatsapp Privacy Configurations.')}
            logger.success('Whatsapp Connection Configurations Updated Successfully')
        });
        const privacySettings = await sock.fetchPrivacySettings(true);
        await db.update({path:'configurations/whatsapp/privacy', data:privacySettings}, async (data) =>{
            if(!data.status === 'success'){logger.warning('Cannot Update Whatsapp Privacy Configurations.')}
            logger.success('Whatsapp Privacy configurations updated successfully')
        });
      } else if (connection === "connecting") {
        logger.info("Connecting to Whatsapp API")
        sev.emit(TYPES.WATSAPP_CONNECTION, {
          type: "connecting",
          level: "info",
        });
      }
    });

    sock.ev.on('messages.upsert', async (upsert) => {
        let {type, messages} = upsert;
        if (type === "notify") {
           for(const message of messages) {
                let { key:{remoteJid, fromMe, id, participant }} = message;
                const ifTarget_data = config.targets.find((target)=>target.account.number===remoteJid || target.account.number===participant);
                if(!ifTarget_data){
                    // NOT IMPLEMENTED YET
                } else {
                    if (ifTarget_data.config.AGMSG) {
                        // handelling AGMSG
                        
                    }
                }

                
           }
        }
    });

   

    sock.ev.on("call", saveCreds);


    // Listening for incoming req
    sev.on(TYPES.REQUEST, async (req) => {
        console.log(req)
        let { type, option, data } = JSON.parse(req);
        if (type === "connect") {
          switch (option) {
            case "code":
              logger.info("User request a pairing code");
              const code = await sock.requestPairingCode(data);
              if (!code) {
                logger.error("Failed to genarate pairing code");
                sev.emit(TYPES.WATSAPP_CONNECTION, {
                  type: "qr",
                  level: "error",
                  message: "Failed to get pairing code",
                });
              }
              logger.success("Pairing code genarated successfully");
              sev.emit(TYPES.WATSAPP_CONNECTION, {
                type: "qr",
                level: "data",
                data: code,
              });
              break;
            case "qr":
              logger.info("User requst QR code");
              if (global.qr) {
                logger.success("QR code already genarated");
                sev.emit(TYPES.WATSAPP_CONNECTION, {
                  type: "qr",
                  level: "data",
                  data: global.qr,
                });
              } else {
                logger.warning("No existed genarated QR");
                sev.emit(TYPES.WATSAPP_CONNECTION, {
                  type: "qr",
                  level: "error",
                  message: "No existed genarated QR",
                });
              }
              break;
          }
        }
      });
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
