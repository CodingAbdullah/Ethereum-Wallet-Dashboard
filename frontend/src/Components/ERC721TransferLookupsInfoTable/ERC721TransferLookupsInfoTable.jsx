import React from 'react';

const ERC721TransferLookupsInfoTable = (props) => {
    const { data } = props;

    return (
        <>
            <h5>ERC721 Token Transfers</h5>
            <div className='erc721-transfer-lookup-table'>
                <table style={{border: '1px solid black'}}>
                    <thead style={{border: '1px solid black'}}>
                    <tr style={{border: '1px solid black'}}>
                        <th style={{border: '1px solid black'}} scope="col">Date</th>
                        <th style={{border: '1px solid black'}} scope="col">Transaction Hash</th>
                        <th style={{border: '1px solid black'}} scope="col">From</th>
                        <th style={{border: '1px solid black'}} scope="col">To</th>
                        <th style={{border: '1px solid black'}} scope="col">Amount</th>
                    </tr>
                    </thead>
                    <tbody>
                        {
                            data.map((record, key) => {
                                return (
                                    <tr id={key}>
                                        <td style={{border: '1px solid black', fontSize: '11px'}}>{record.block_timestamp.split("T")[0]}</td>
                                        <td style={{border: '1px solid black', fontSize: '11px'}}>{record.transaction_hash}</td>
                                        <td style={{border: '1px solid black', fontSize: '11px'}}>{record.from_address}</td>
                                        <td style={{border: '1px solid black', fontSize: '11px'}}>{record.to_address}</td>
                                        <td style={{border: '1px solid black', fontSize: '11px'}}>{record.amount}</td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
            </div>
            <hr style={{ marginTop: '3rem', marginBottom: '3rem' }} /> 
        </>
    )
}

export default ERC721TransferLookupsInfoTable;