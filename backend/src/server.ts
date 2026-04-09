import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import portfolioRoutes from "./routes/portfolio.js";
import chatRoutes from "./routes/chat-groq.js";
import uploadRoutes from "./routes/upload.js";

dotenv.config({ path: '.env' });

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = [process.env.FRONTEND_URL, process.env.ADMIN_URL].filter(
  (origin): origin is string => Boolean(origin)
);

// Middleware
app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI!)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// Routes
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/upload", uploadRoutes);

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "✅ Backend is running!" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
