const express = require("express");
const router = express.Router();
const GasTrackerController = require("../Controller/GasTrackerController");

// Add routes for Gas Track information
router.get('/gas-track', GasTrackerController.gasTrackInformation);

module.exports = router;