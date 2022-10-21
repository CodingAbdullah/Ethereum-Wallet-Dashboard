const express = require("express");
const router = express.Router();
const ERC720CollectionController = require("../Controller/ERC720CollectionController");

// Add routes to be passed to node backend server
router.post("/erc20-token-price", ERC720CollectionController.getTokenPrice);
router.post("/erc20-transfer", ERC720CollectionController.getTokenTransfer);

module.exports = router;