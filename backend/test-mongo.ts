import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

console.log("Attempting to connect to:", process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI!, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
        console.log("✅ Connection successful!");
        process.exit(0);
    })
    .catch((err) => {
        console.error("❌ Connection failed!");
        console.error(err);
        process.exit(1);
    });
