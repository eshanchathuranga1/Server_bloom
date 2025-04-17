const sendNotification = require("@utils/send_notify");
const logger = require("@utils/logger");
const { downloadMediaMessage, getContentType } = require('baileys');
const TYPES = require('@types/events')

module.exports = target_handler = async (
    sock,
    sev,
    db,
    google,
    msg,
    target_config,
    config
) => {
    try {
        let { key, messageTimestamp, pushName, message } = msg;
        // const ppUrl = await sock.profilePictureUrl(key.remoteJid, 'image')
        const isStatusMessage = key.remoteJid === "status@broadcast" ? true : false;
        const time = new Date(messageTimestamp * 1000).toLocaleString("en-US", {
            hour12: false,
            });
        if (!isStatusMessage) {
            // Conversation message
        } else {
            // ststus broadcast
            const mediaKey = Object.keys(message);
            let mediaType = mediaKey.includes("extendedTextMessage")
                ? "extendedTextMessage"
                : mediaKey.includes("imageMessage")
                    ? "imageMessage"
                    : mediaKey.includes("videoMessage")
                        ? "videoMessage"
                        : undefined;
            let pic;
            try {
                const ppUrl = await sock.profilePictureUrl(key.participant, "image");
                pic = ppUrl;
            } catch (error) {
                pic = "https://i.ibb.co/DgDx2GG3/bloom-logo.png";
                logger.warning("Error getting target profile picture");
                sev.emit(TYPES.SYSTEM_WARNING, {
                    message: "Error getting target profile picture",
                })
            }
            switch (mediaType) {
                case "extendedTextMessage": //handeling text status
                    const { text } = message[mediaType];
                    await sendNotification({
                        title: `${target_config.account.name} send a text status. (${time})`,
                        message: text,
                        url: "http://sky-7.live",
                        icon: pic,
                        actions: ['{"title":"View", "url":"https://sky-7.live"}'],
                    })
                        .then((data) => {
                            sev.emit(TYPES.TARGET, {
                                type: 'status',
                                data: {
                                    remoteJid: key.remoteJid,
                                    message: text,
                                }
                            });
                        })
                        .catch((err) => {
                            sev.emit(TYPES.SYSTEM_ERROR, {
                                message: "Error sending notification",
                            })
                        });
                    break;
                case "imageMessage":
                    const { caption } = message[mediaType];
                    console.log(caption);
            }
        }
    } catch (error) {
        throw error;
    }
};
