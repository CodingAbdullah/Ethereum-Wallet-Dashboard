import React from 'react';

const ERC721InfoTable = (props) => {
    const { data } = props; // Destructure data

    return (
        // Display data of the ERC721 holdings
        <table>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Token Address</th>
                <th scope="col">Token Id</th>
                <th scope="col">Symbol</th>
                <th scope="col">Link</th>
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
                                <td><a href={"https://opensea.io/assets/ethereum/" + record.token_address + "/" + record.token_id} target="_blank" rel="noreferrer">NFT Link</a></td>
                            </tr>
                    )
                })}
            </tbody>
        </table>   
    )
}

export default ERC721InfoTable;