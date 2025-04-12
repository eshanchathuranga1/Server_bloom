const { MongoClient, ServerApiVersion } = require("mongodb");

const database = {
  connect: async function () {
    const client = new MongoClient(process.env.MONGODB_URI, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });

    try {
      await client.connect();
      return client;
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
      throw error;
    }
  },
  close: async function (client) {
    try {
      await client.close();
    } catch (error) {
      console.error("Error closing MongoDB connection:", error);
    }
  },
  addUser: async function (params) {
    const { id, tokens, timestamp, ip, location } = params;
    let client;
    try {
      client = await database.connect();
      const collection = client.db("bloom_auth").collection("users");

      const existingUser = await collection.findOne({ ip });
      if (existingUser) {
        return {
          status: "exixts",
          message: "User already exists",
          data: existingUser,
        };
      }

      const newUser = { id, tokens, timestamp, ip, location };
      const result = await collection.insertOne(newUser);
      return {
        status: "success",
        message: "User added successfully",
        data: result,
      };
    } catch (error) {
      console.error("Error adding user:", error);
      return {
        status: "error",
        message: "Error adding user",
        error,
      };
    } finally {
      if (client) await database.close(client);
    }
  },
  changeTokens: async function (params) {
    const { id, tokens } = params;
    let client;
    try {
      client = await database.connect();
      const collection = client.db("bloom_auth").collection("users");
      const result = await collection.updateOne({ id }, { $set: { tokens } });
      return result;
    } catch (error) {
      console.error("Error updating tokens:", error);
      throw error;
    } finally {
      if (client) await database.close(client);
    }
  },
  getUser: async function (id) {
    let client;
    try {
      client = await database.connect();
      const collection = client.db("bloom_auth").collection("users");
      const user = await collection.findOne({ id });
      return {
        status: "success",
        message: "User found",
        data: user,
      };
    } catch (error) {
      throw error;
    } finally {
      if (client) await database.close(client);
    }
  },
  deleteUser: async function (id) {
    let client;
    try {
      client = await database.connect();
      const collection = client.db("bloom_auth").collection("users");

      const result = await collection.deleteOne({ id });
      console.log("User deleted:", result);
      return result;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    } finally {
      if (client) await database.close(client);
    }
  },
  addTokenBlacklist: async function (params) {
    let client;
    try {
      client = await database.connect();
      const collection = client.db("bloom_auth").collection("token_blacklist");

      const result = await collection.insertOne(params);
      return {
        status: "success",
        message: "Token blacklisted successfully",
        data: result,
      };
    } catch (error) {
      throw error;
    } finally {
      if (client) await database.close(client);
    }
  },
  addUserBlacklist: async function (params) {
    let client;
    try {
      client = await database.connect();
      const collection = client.db("bloom_auth").collection("users");
      // check if user already exists
      const blacklistCollection = client
        .db("bloom_auth")
        .collection("users_blacklist");
      const result = await blacklistCollection.insertOne(params);
      // delete user from users collection
      const deleteResult = database.deleteUser(params.id);
      if (deleteResult) {
        return {
          status: "success",
          message: "User blacklisted successfully",
          data: result,
        };
      }
    } catch (error) {
      return {
        status: "error",
        message: "Error blacklisting user",
        error,
      };
    } finally {
      if (client) await database.close(client);
    }
  },
};

module.exports = database;
