const express = require("express");
const router = express.Router();
const ERC720CollectionController = require("../Controller/ERC720CollectionController");

// Add routes to be passed to node backend server
router.get("/top-erc20-tokens", ERC720CollectionController.getTopERC20Tokens);
router.post("/erc20-token-price", ERC720CollectionController.getTokenPrice);
router.post("/erc20-transfer", ERC720CollectionController.getTokenTransfer);
router.post("/erc20-owners", ERC720CollectionController.getTokenOwners);

module.exports = router;