const { initializeApp } = require("firebase/app");
const { getDatabase, ref, set, onValue, child, push, update } = require("firebase/database");
const { models } = require("mongoose");

class firebase {
  constructor() {
    this.config =   {
        apiKey: "AIzaSyAlpdatStxM0Ug3ojbWniD1eboMjsbCJ2g",
        authDomain: "bloom-eba6d.firebaseapp.com",
        projectId: "bloom-eba6d",
        storageBucket: "bloom-eba6d.firebasestorage.app",
        messagingSenderId: "1068361928296",
        appId: "1:1068361928296:web:e2f465b41079143d2875dd"
      }
    this.app = initializeApp(this.config);
  }
}

class realtimeDatabase extends firebase {
  constructor() {
    super();
    this.db = getDatabase(this.app);
  }
  async write(params, callback) {
    let { path, data } = params;
    try {
      await set(ref(this.db, path), data);
      callback(null, {
        status: "success",
        message: "Data written successfully",
      });
    } catch (error) {
      callback(
        {
          status: "error",
          message: "Error writing data",
          error: error,
        },
        null
      );
    }
  }
  async isUpdate(path, callback) {
    try {
        const dbRef = ref(this.db, path);
        const unsubscribe = onValue(dbRef, (snapshot)=> {
            const data = snapshot.val();
            callback(null, data);
        }, (error) => {
            callback({
                status: "error",
                message: "Error checking for updates",
            }, null)
        });
        
    } catch (error) {
        callback({
            status: "error",
            message: "Error checking for updates",
        }, null)
    }
  }
  async update(params, callback) {
    let { path, data } = params;
    try {
       await update(ref(this.db, path), data);
       callback(null, {
           status: "success",
           message: "Data updated successfully",
       });
        
    } catch (error) {
        callback({
            status: "error",
            message: "Error updating data",
            error
        }, null)
    }
  }
}

module.exports = realtimeDatabase;
