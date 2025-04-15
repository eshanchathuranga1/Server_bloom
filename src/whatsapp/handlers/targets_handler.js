


module.exports = target_handler = async (sock, sev, db, message, config) => {
    await sock.sendMessage('94723636800@s.whatsapp.net', { text: 'hello word' })
}