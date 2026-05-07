import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./db/connectdb.js";
import disconnectDB from "./db/connectdb.js";

dotenv.config({ path: "./.env" });

const port = process.env.PORT || 3000;

let server;

// Handle uncaught exceptions FIRST
process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
    process.exit(1);
});


connectDB()
    .then(() => {
        server = app.listen(port, () => {
            console.log(`✔ App listening on Port http://localhost:${port}`);
        });
    })
    .catch((err) => {
        console.error("MONGODB connection failed ", err);
    });


// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection:", err);

    if (server) {
        server.close(async () => {
            await disconnectDB();
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
});

// Graceful shutdown (Docker / hosting)
process.on("SIGTERM", () => {
    console.log("SIGTERM received. Shutting down...");

    if (server) {
        server.close(async () => {
            await disconnectDB();
            process.exit(0);
        });
    }
});

// Local shutdown (Ctrl + C)
process.on("SIGINT", () => {
    console.log("SIGINT received. Shutting down...");

    if (server) {
        server.close(async () => {
            await disconnectDB();
            process.exit(0);
        });
    }
});