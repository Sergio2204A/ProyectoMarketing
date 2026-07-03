const express = require("express");
const multer = require("multer");
const router = express.Router();
const { generateImage } = require("../controllers/imageController");
const { protect } = require("../middleware/authMiddleware");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Solo se permiten archivos de imagen"));
  },
});

router.post("/generate", protect, upload.single("image"), generateImage);

module.exports = router;
