const express = require("express");
const router = express.Router();

const instagramController = require("../controllers/instagramController");

router.get("/profile/:username", instagramController.getProfile);

module.exports = router;