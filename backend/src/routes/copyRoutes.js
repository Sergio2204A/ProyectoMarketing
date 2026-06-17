const express = require("express");
const copyController = require("../controllers/copycontroller");

const router = express.Router();

router.post("/", copyController.generateCopy);

module.exports = router;