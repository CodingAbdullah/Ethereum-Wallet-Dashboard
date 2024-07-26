require("dotenv").config({ path: '../.env' });
const bcryptjs = require("bcryptjs");

exports.authenticateRequestKey = async (req, res, next) => {
    const hashedApiKey = req.body.headers.Authorization.split(" ")[1]; // Format is Authorization: Bearer <token>

    if (!hashedApiKey) {
        res.status(400).json({
            message: "No token found, authorization denied"
        });
    }
    else {
        // Compare hashed key to secret and check to see if it is valid
        bcryptjs.compare(hashedApiKey, process.env.SECRET, (err, decoded) => {
            if (err){
                res.status(400).json({
                    message: "Could not decode given token"
                });
            }
            else {
                // If a match is found, proceed to the next function (controller)
                if (decoded) {
                    next();
                }
                // If no match is found, return a status code of 401
                else {
                    res.status(401).json({
                        message: "Invalid API Key"
                    });
                }
            }
        });
    }
};