const realtimeDatabase = require('@utils/firebase')
const db = new realtimeDatabase()

module.exports ={
    wachingUpdates: async (ev) => {
        await db.isUpdate('configurations', ev,  data => {
            global.config = data
            console.log(data)
        })
    }
}