const express =require('express');
const router = express.Router();
const addressToEnsController = require("../Controller/AddressToEnsController");

// Add routes to be passed to node backend server
router.post("/additional-address-to-ens-information", addressToEnsController.additionalENSInformation);
router.post("/ens-ownership-information", addressToEnsController.ensOwnershipInformation);
router.post("/ens-resolver-information", addressToEnsController.ensResolverInformation);


module.exports = router;