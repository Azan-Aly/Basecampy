import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./db/connectdb.js";

dotenv.config({ path: "./.env" });

const port = process.env.PORT || 3000;

connectDB()
    .then(() => {
        app.listen(port, () => {
            console.log(`✔✅ App listening on Port http://localhost:${port}`);
        });
    })
    .catch((err) => {
        console.error("MONGODB connection failed ", err);
    });
