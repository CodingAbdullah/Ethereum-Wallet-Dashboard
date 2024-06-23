const express = require('express');
const router = express.Router();
const coinPriceController = require("../Controller/CoinPricesController");

// Add coin price routes and pass them to the node backend server
router.get("/coin-prices", coinPriceController.coinPrices);
router.get("/top-bottom-coin-prices", coinPriceController.topBottomCoins);
router.post("/coin-prices-by-day", coinPriceController.coinPricesByDay);
router.post('/current-ERC20-price', coinPriceController.currentERC20CoinPrice);
router.post("/simple-price-data", coinPriceController.currentCoinPrice);
router.post("/ERC20-coin-information", coinPriceController.ERC20CoinInfo);
router.post("/ERC20-coin-price-duration", coinPriceController.ERC20CoinPriceDuration);
router.get("/homepage-bitcoin-price", coinPriceController.homePageBitcoinPrice);
router.get("/global-market-data", coinPriceController.homePageGlobalMarketData);
router.get("/trending-coin-data", coinPriceController.homePageTrendingCoins);
router.get("/navbar-ethereum-price", coinPriceController.navbarEthPrice);

module.exports = router;