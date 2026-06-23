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

const connectDB = require("./db");

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.json({ message: "Backend funcionando" }));

app.use("/auth", authRoutes);
app.use("/campaign", campaignRoutes);
app.use("/copy", copyRoutes);
app.use("/hashtag", hashtagRoutes);
app.use("/calendar", calendarRoutes);
app.use("/history", historyRoutes);
app.use("/trends", trendsRoutes);
app.use("/refine", refineRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
