import mongoose from "mongoose";

const disconnectDB = async () => {
    try {
        await mongoose.connection.close();
        console.log("MongoDB Disconnected!!!");
    } catch (error) {
        console.error("Error disconnecting from MongoDB", error);
        process.exit(1);
    }
};

export default disconnectDB;
