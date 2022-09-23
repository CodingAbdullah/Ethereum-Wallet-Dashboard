const express = require('express');
const router = express.Router();
const ERC721HoldingsController = require("../Controller/ERC721HoldingsController");

router.post('/address-erc721-holdings', ERC721HoldingsController.getAddressTokenHoldings);
router.post('/address-erc721-transfers', ERC721HoldingsController.getAddressTokenTransfers);

module.exports = router;