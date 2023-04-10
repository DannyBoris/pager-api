const mongoose = require("mongoose");
const username = "danny";
const password = "tpifSP1062016";
const conn_str = `mongodb+srv://${username}:${password}@serverlessinstance0.txootgs.mongodb.net/?retryWrites=true&w=majority`;
const db_name = "linkedin_app";
const user_collection = "users";

const db = async (dbName) => {
  try {
    connection = await mongoose.connect(conn_str, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName,
    });
    console.log("connected");
  } catch (e) {
    console.error(`Could not connect to DB ${e}`);
  }
  return mongoose.connection;
};
module.exports = db;
