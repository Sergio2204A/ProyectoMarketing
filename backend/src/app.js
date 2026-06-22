require("dotenv").config();
const express = require("express");
const cors = require("cors");

const campaignRoutes = require("./routes/campaignRoutes");
const copyRoutes = require("./routes/copyRoutes");
const hashtagRoutes = require("./routes/hashtagRoutes");
const calendarRoutes = require("./routes/calendarRoutes");
const authRoutes = require("./routes/authRoutes");

const connectDB = require("./db");

// Conectar a MongoDB
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

app.get("/", (req, res) => {
  res.json({
    message: "Backend funcionando"
  });
});
console.log("ANTES CAMPAIGN");
console.log(campaignRoutes);
app.use("/campaign", campaignRoutes);

console.log("ANTES COPY");
app.use("/copy", copyRoutes);

console.log("ANTES HASHTAG");
app.use("/hashtag", hashtagRoutes);

console.log("ANTES CALENDAR");
app.use("/calendar", calendarRoutes);

app.use("/auth", authRoutes);

console.log("DESPUES DE TODO");
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});