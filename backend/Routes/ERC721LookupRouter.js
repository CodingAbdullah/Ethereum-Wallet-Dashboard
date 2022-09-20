const express = require("express");
const router = express.Router();
const ERC721LookupController = require("../Controller/ERC721LookupController");

router.post('/erc721-sales-by-id', ERC721LookupController.erc721SalesById);

module.exports = router;