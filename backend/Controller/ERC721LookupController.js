const sdk = require('api')('@transpose/v0#klm8731l7j8jla0'); // Unique identifier for Transpose APIs found in docs

exports.erc721SalesById = (req, res) => {
    const { address, id } = JSON.parse(req.body.body); // Parse information for make API call

    sdk.get('/sales-by-token-id?contract_address=' + address + '&token_id=' + id + '&order=desc', { 'x-api-key': process.env.TRANSPOSE_API_KEY })
    .then(response => res.status(200).json({ information: response }))
    .catch(err => res.status(400).json({ information: err }))
}