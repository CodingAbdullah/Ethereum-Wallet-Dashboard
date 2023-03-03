import React from 'react';

const ERC721CollectionTransferInfoTable = (props) => {
    const { data } = props;

    // Retrieve transfers from the entire collection
    return (
        <div className="p-3">
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