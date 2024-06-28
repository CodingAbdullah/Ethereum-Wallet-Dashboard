const express = require("express");
const router = express.Router();
const MarketDataController = require("../Controller/MarketDataController");

// Add route for Global Market Cap Data
router.get('/global-market-cap-chart-data', MarketDataController.globalMarketCapData);

module.exports = router;