require("dotenv").config({ path: '.env'}); // Incorporate environment variables file
const express = require("express");
const cors = require("cors"); // Allow Cross Origin Resource Sharing
const addressToEnsRouter = require("./Routes/AddressToEnsRouter");

const app = express(); // Sign up node server

app.listen(process.env.PORT || 8080, () => {
    console.log("Listening to PORT " + process.env.PORT || 8080); // Set listening port. If not available, default to 8080
});

// Set up req-res structure
app.use(express.json({ extended: false}));
app.use(express.urlencoded({ extended: false}));

app.use(cors()); // Enable cors;
app.use("/", addressToEnsRouter); // Enable API resource to server
