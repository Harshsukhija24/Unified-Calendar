import { MongoClient } from "mongodb";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const connection_string = process.env.MONGO_URL;
const databaseName = process.env.DBNAME;
const client = new MongoClient(connection_string);

export const databaseConnection = async () => {
  try {
    // Connect MongoDB client
    await client.connect();
    console.log("Connected successfully to MongoDB client");

    // Connect Mongoose
    await mongoose.connect(connection_string, {
      dbName: databaseName,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected successfully to Mongoose");
  } catch (error) {
    console.error(`Error in database connection ${error}`);
  }
};

export const clientConnection = (databaseCollection) => {
  try {
    const db = client.db(databaseName);
    const collection = db.collection(databaseCollection);
    return collection;
  } catch (error) {
    console.error("Error in database client connection", error);
  }
};
