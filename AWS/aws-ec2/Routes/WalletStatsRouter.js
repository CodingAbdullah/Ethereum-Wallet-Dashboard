const express = require('express');
const router = express.Router();
const WalletStatsController = require("../Controller/WalletStatsController");

router.post("/address-details", WalletStatsController.addressDetails);
router.post("/address-transaction-details", WalletStatsController.transactionsByAddress);
router.post("/address-erc20-holdings", WalletStatsController.addressERC20Holdings);
router.post("/address-erc721-holdings", WalletStatsController.addressERC721Holdings);
router.post("/address-net-worth", WalletStatsController.walletNetWorth);

module.exports = router;