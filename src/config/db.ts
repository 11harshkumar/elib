import mongoose from "mongoose";
import { config } from "./config";

const connectDB = async () => {
    try {
        mongoose.connection.on("connected", () => {
            console.log("Database Connected Successfuly...");
        });

        mongoose.connection.on("error", (err) => {
            console.log("Error in connnecting to Database...", err);
        });

        await mongoose.connect(config.databaseUrl as string);
    } catch (err) {
        console.error("Connection Failed to Database", err);
        process.exit(1);
        // Good to exit from the process if the database connection is not established...
    }
};

export default connectDB;
