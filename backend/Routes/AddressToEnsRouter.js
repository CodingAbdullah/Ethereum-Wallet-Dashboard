const express =require('express');
const router = express.Router();
const addressToEnsController = require("../Controller/AddressToEnsController");

router.post("/additional-address-to-ens-information", addressToEnsController.additionalENSInformation);

module.exports = router;