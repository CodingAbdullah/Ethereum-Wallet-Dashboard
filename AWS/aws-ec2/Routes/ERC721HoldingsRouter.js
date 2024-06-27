const express = require('express');
const router = express.Router();
const ERC721HoldingsController = require("../Controller/ERC721HoldingsController");

// Add routes to be passed to node backend server
router.post('/address-erc721-holdings', ERC721HoldingsController.getAddressTokenHoldings);
router.post('/address-erc721-transfers', ERC721HoldingsController.getAddressTokenTransfers);
router.post('/address-erc721-collection-holdings', ERC721HoldingsController.getERC721CollectionHoldings);

module.exports = router;