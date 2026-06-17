const express = require("express");

const router = express.Router();

const hashtagController =
require("../controllers/hashtagController");

console.log("CONTROLADOR:", hashtagController);

const { generateHashtags } =
hashtagController;

console.log("generateHashtags =", generateHashtags);

router.post(
  "/",
  generateHashtags
);

module.exports = router;