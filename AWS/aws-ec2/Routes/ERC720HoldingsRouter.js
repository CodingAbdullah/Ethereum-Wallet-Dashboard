const express =require('express');
const router = express.Router();
const ERC720HoldingsController = require("../Controller/ERC720HoldingsController");

// Add routes to be passed to node backend server
router.post("/address-erc20-holdings", ERC720HoldingsController.getAddressTokenHoldings);
router.post("/address-erc20-transfers", ERC720HoldingsController.getAddressTokenTransfers);

module.exports = router;