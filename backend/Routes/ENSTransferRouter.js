const express = require("express");
const router = express.Router();
const ENSTransferController = require('../Controller/ENSTransferController');

router.post("/ens-transfers-by-name", ENSTransferController.ensTransfersByName);
router.post("/ens-transfers-by-id", ENSTransferController.ensTransfersById);

module.exports = router;