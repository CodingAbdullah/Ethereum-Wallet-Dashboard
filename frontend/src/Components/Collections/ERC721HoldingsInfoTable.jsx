import React from 'react';

const ERC721HoldingsInfoTable = (props) => {
    const { data } = props; // Destructure data

    return (
        <div class="col-md-9 ml-sm-auto col-lg-10 px-md-4">
            <table style={{border: '1px solid black'}}>
                <thead style={{border: '1px solid black'}}>
                <tr style={{border: '1px solid black'}}>
                    <th style={{border: '1px solid black'}} scope="col">Name</th>
                    <th style={{border: '1px solid black'}} scope="col">Token Address</th>
                    <th style={{border: '1px solid black'}} scope="col">Symbol</th>
                    <th style={{border: '1px solid black'}} scope="col">Link</th>
                </tr>
                </thead>
                <tbody style={{border: '1px solid black'}}>
                    { data.result.map(record => {
                        return (
                                <tr style={{border: '1px solid black'}}>
                                    <td style={{border: '1px solid black'}}>{record.name}</td>
                                    <td style={{border: '1px solid black'}}>{record.token_address}</td>
                                    <td style={{border: '1px solid black'}}>{record.symbol}</td>
                                    <td style={{border: '1px solid black'}}><a href={"https://opensea.io/assets/ethereum/" + record.token_address + "/" + record.token_id} target="_blank" rel="noreferrer">NFT Link</a></td>
                                </tr>
                        )
                    })}
                </tbody>
            </table>   
        </div>
    )
}

export default ERC721HoldingsInfoTable;