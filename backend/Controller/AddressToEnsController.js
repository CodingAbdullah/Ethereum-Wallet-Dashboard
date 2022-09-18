const sdk = require('api')('@transpose/v0#3xj19sl7j8jtul'); // Unique identifier for Transpose APIs found in docs

exports.additionalENSInformation = (req, res) => {
    const { ensName } = JSON.parse(req.body.body);

    sdk.get('/ens-records-by-name?ens_names=' + ensName, { 'x-api-key': process.env.TRANSPOSE_API_KEY })
    .then(response => {
        res.status(200).json({
            information: response // Send response with status 200 and information
        })
    })
    .catch(err => {
        res.status(400).json({
            information: err // Send response with status 400 and information
        })
    });
}