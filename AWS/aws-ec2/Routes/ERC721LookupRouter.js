const express = require("express");
const router = express.Router();
const ERC721LookupController = require("../Controller/ERC721LookupController");

// Add routes for ERC721 lookups
router.post('/erc721-sales-by-id', ERC721LookupController.erc721SalesById);
router.post('/erc721-lookup-by-id', ERC721LookupController.erc721TokenLookup);
router.post('/erc721-lookup-transfer-by-id', ERC721LookupController.erc721TokenTransferLookup);
router.post('/erc721-lookup-rarity-by-id', ERC721LookupController.erc721TokenRarityLookup);
router.post('/erc721-lookup-opensea-information', ERC721LookupController.erc721TokenOpenseaInformation);

module.exports = router;