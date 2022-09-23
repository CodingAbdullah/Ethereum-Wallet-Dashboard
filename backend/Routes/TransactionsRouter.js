const express = require("express");
const router = express.Router();
const TransactionsController = require('../Controller/TransactionsController');

// Add routes to be passed to node backend server
router.post("/address-transaction-amount", TransactionsController.getAddressTransactionBalance);
router.post("/address-transaction-history", TransactionsController.getAddressTransactionHistory);

module.exports = router;