import React from 'react';

const ERC721InfoTable = (props) => {
    const { data, walletAddress } = props; // Destructure data

    return (
        // Display data of the ERC721 holdings
        <table>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Token Address</th>
                <th scope="col">Token Id</th>
                <th scope="col">Symbol</th>
                <th scope="col">Amount</th>
              </tr>
            </thead>
            <tbody>
                { data.result.map(record => {
                    return (
                            <tr>
                                <td>{record.name}</td>
                                <td>{record.token_address}</td>
                                <td>{record.token_id}</td>
                                <td>{record.symbol}</td>
                                <td>{record.amount}</td>
                            </tr>
                    )
                })}
            </tbody>
        </table>   
    )
}

export default ERC721InfoTable;