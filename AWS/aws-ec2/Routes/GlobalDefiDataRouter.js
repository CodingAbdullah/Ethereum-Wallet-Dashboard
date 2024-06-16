const express = require("express");
const router = express.Router();
const GlobalDefiDataController = require("../Controller/GlobalDefiDataController");

// Add routes for ERC721 lookups
router.get('/global-defi-data', GlobalDefiDataController.globalDefiData);

module.exports = router;