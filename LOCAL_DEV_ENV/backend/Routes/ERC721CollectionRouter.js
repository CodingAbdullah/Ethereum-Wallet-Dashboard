const express = require("express");
const router = express.Router();
const ERC721CollectionController = require('../Controller/ERC721CollectionController');

// Add routes to be passed to node backend server
router.post('/erc721-collection-data', ERC721CollectionController.getERC721CollectionData);
router.post('/erc721-collection-lowest-sale', ERC721CollectionController.getLowestERC721CollectionSale);
router.post('/erc721-collection-transfers', ERC721CollectionController.getERC721CollectionTransfers);
router.post('/erc721-collection-sales', ERC721CollectionController.getERC721CollectionSales);
router.post('/erc721-collection-floor-price', ERC721CollectionController.getERC721CollectionFloorPrice);
router.post('/erc721-collection-attributes', ERC721CollectionController.getERC721CollectionAttributes);

module.exports = router;