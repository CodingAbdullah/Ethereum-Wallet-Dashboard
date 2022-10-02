import React from 'react';

const ERC721CollectionTransferInfoTable = (props) => {
    const { data, quantity } = props;

    // Retrieve transfers from the entire collection
    return (
        <div style={{marginTop: '3rem'}} className="col-md-9 ml-sm-auto col-lg-10 px-md-4">
            <h5><b>NFT Transfers from Wallet to Wallet</b></h5>
            <h6><b>Total NFT Transfers: {quantity}</b></h6>
            <table style={{border: '1px solid black'}} >
                <thead style={{border: '1px solid black'}}>
                <tr style={{border: '1px solid black'}}>
                    <th style={{border: '1px solid black'}} scope="col">ID</th>
                    <th style={{border: '1px solid black'}} scope="col">From</th>
                    <th style={{border: '1px solid black'}} scope="col">To</th>
                    <th style={{border: '1px solid black'}} scope="col">Amount</th>
                    <th style={{border: '1px solid black'}} scope="col">Time</th>
                </tr>
                </thead>
                <tbody>
                    {
                        data.map((record, key) => {
                            return (
                                <tr id={key} style={{border: '1px solid black'}}>
                                    <td style={{border: '1px solid black', fontSize: '15.5px'}}>{record.token_id}</td>
                                    <td style={{border: '1px solid black', fontSize: '15.5px'}}>{record.from_address}</td>
                                    <td style={{border: '1px solid black', fontSize: '15.5px'}}>{record.to_address}</td>
                                    <td style={{border: '1px solid black', fontSize: '15.5px'}}>{record.amount}</td>
                                    <td style={{border: '1px solid black', fontSize: '15.5px'}}>{record.block_timestamp.split("Z")[0]}</td>
                                </tr>
                            )
                        })
                    }
                </tbody>
            </table>
        </div>
    )

}

export default ERC721CollectionTransferInfoTable;