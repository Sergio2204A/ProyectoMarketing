require("dotenv").config();
const express = require("express");
const cors = require("cors");

const campaignRoutes = require("./routes/campaignRoutes");
const copyRoutes = require("./routes/copyRoutes");
const hashtagRoutes = require("./routes/hashtagRoutes");
const calendarRoutes = require("./routes/calendarRoutes");
const authRoutes = require("./routes/authRoutes");
const historyRoutes = require("./routes/historyRoutes");
const trendsRoutes = require("./routes/trendsRoutes");
const refineRoutes = require("./routes/refineRoutes");
const publishRoutes = require("./routes/publishRoutes");
const videoRoutes = require("./routes/videoRoutes");
const imageRoutes = require("./routes/imageRoutes");
const socialAuthRoutes = require("./routes/socialAuthRoutes");

const connectDB = require("./db");
const { startReminderScheduler } = require("./services/reminderScheduler");

connectDB();
startReminderScheduler();

const app = express();

const allowedOrigins = [
  ...(process.env.FRONTEND_URL || "").split(",").map((url) => url.trim()),
  "http://localhost:5173",
].filter(Boolean);
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get("/", (req, res) => res.json({ message: "Backend funcionando" }));
app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use("/campaign", campaignRoutes);
app.use("/copy", copyRoutes);
app.use("/hashtag", hashtagRoutes);
app.use("/calendar", calendarRoutes);
app.use("/history", historyRoutes);
app.use("/trends", trendsRoutes);
app.use("/refine", refineRoutes);
app.use("/publish", publishRoutes);
app.use("/video", videoRoutes);
app.use("/image", imageRoutes);
app.use("/social", socialAuthRoutes);

app.use((err, req, res, next) => {
  console.error("Error no controlado:", err);
  res.status(500).json({ success: false, message: "Error interno del servidor" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
