import express, { Request, Response } from "express";
import multer from "multer";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import Portfolio from "../models/Portfolio.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST - Upload profile picture
router.post("/profile-image", upload.single("image"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image provided" });
    }

    const password = req.query.password as string;
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Convert buffer to base64 for Cloudinary
    const base64Data = req.file.buffer.toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${base64Data}`;

    const imageUrl = await uploadToCloudinary(dataURI, "portfolio/profile");

    // Update portfolio with new image URL
    let portfolio = await Portfolio.findOne();
    if (!portfolio) {
      portfolio = new Portfolio({
        bio: "Welcome to my portfolio",
        profileImage: imageUrl,
        skills: [],
        projects: [],
        experience: [],
        contact: {
          email: "",
          github: "",
          linkedin: "",
        },
      });
    } else {
      portfolio.profileImage = imageUrl;
    }

    await portfolio.save();

    res.json({
      message: "Profile image updated successfully",
      imageUrl: imageUrl,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

// POST - Upload project image
router.post("/project-image", upload.single("image"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image provided" });
    }

    const password = req.query.password as string;
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const base64Data = req.file.buffer.toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${base64Data}`;

    const imageUrl = await uploadToCloudinary(dataURI, "portfolio/projects");

    res.json({
      message: "Project image uploaded successfully",
      imageUrl: imageUrl,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

// POST - Upload resume file (PDF or Image)
router.post("/resume", upload.single("resume"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const password = req.query.password as string;
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Convert buffer to dataURI for Cloudinary
    const base64Data = req.file.buffer.toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${base64Data}`;

    // Upload to Cloudinary - resource_type: auto handles PDF
    const fileUrl = await uploadToCloudinary(dataURI, "portfolio/resumes");

    res.json({
      message: "Resume uploaded successfully",
      imageUrl: fileUrl,
    });
  } catch (error) {
    console.error("Resume upload error:", error);
    res.status(500).json({ error: "Failed to upload resume" });
  }
});

export default router;
