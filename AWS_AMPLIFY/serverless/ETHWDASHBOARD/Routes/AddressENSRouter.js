const express =require('express');
const router = express.Router();
const addressENSController = require("../Controller/AddressENSController");

// Add routes to be passed to node backend server
router.post("/additional-address-to-ens-information", addressENSController.additionalENSInformation);
router.post("/ens-ownership-information", addressENSController.ensOwnershipInformation);
router.post("/ens-resolver-information", addressENSController.ensResolverInformation);

module.exports = router;