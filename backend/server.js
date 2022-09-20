require("dotenv").config({ path: '.env'}); // Incorporate environment variables file
const express = require("express");
const cors = require("cors"); // Allow Cross Origin Resource Sharing
const addressENSRouter = require("./Routes/AddressENSRouter");
const ENSTransferRouter = require("./Routes/ENSTransferRouter");
const ERC721LookupRouter = require("./Routes/ERC721LookupRouter");

const app = express(); // Sign up node server

app.listen(process.env.PORT || 8080, () => {
    console.log("Listening to PORT " + process.env.PORT || 8080); // Set listening port. If not available, default to 8080
});

// Set up req-res structure
app.use(express.json({ extended: false}));
app.use(express.urlencoded({ extended: false}));

app.use(cors()); // Enable cors;
app.use("/", addressENSRouter); // Enable API resource to server
app.use("/", ENSTransferRouter);
app.use("/", ERC721LookupRouter);
