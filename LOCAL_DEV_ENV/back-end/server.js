require("dotenv").config({ path: '.env' }); // Incorporate environment variables file
const express = require("express");
const cors = require("cors"); // Allow Cross Origin Resource Sharing
const addressENSRouter = require("./Routes/AddressENSRouter");
const CoinPricesRouter = require("./Routes/CoinPriceRouter");
const ENSTransferRouter = require("./Routes/ENSTransferRouter");
const ERC720CollectionRouter = require("./Routes/ERC720CollectionRouter");
const ERC720HoldingsRouter = require("./Routes/ERC720HoldingsRouter");
const ERC721CollectionRouter = require('./Routes/ERC721CollectionRouter');
const ERC721LookupRouter = require("./Routes/ERC721LookupRouter");
const ERC721HoldingsRouter = require('./Routes/ERC721HoldingsRouter');
const GasTrackerRouter = require('./Routes/GasTrackerRouter');
const TransactionsRouter = require('./Routes/TransactionsRouter');
const WalletStatsRouter = require('./Routes/WalletStatsRouter');

const app = express(); // Spin up a node server

app.listen(process.env.PORT || 8080, () => {
    console.log("Listening to PORT " + process.env.PORT || 8080); // Set listening port. If not available, default to 8080
});

// Set up req-res structure
app.use(express.json({ extended: false }));
app.use(express.urlencoded({ extended: false }));

app.use(cors()); // Enable cors
app.use("/", addressENSRouter); // Enable API resource to server
app.use("/", CoinPricesRouter);
app.use("/", ENSTransferRouter);
app.use("/", ERC720CollectionRouter);
app.use("/", ERC720HoldingsRouter);
app.use("/", ERC721CollectionRouter);
app.use("/", ERC721LookupRouter);
app.use("/", ERC721HoldingsRouter);
app.use("/", GasTrackerRouter);
app.use("/", TransactionsRouter);
app.use("/", WalletStatsRouter);