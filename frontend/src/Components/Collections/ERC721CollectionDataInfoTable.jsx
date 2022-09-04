import React from 'react';

const ERC721CollectionDataInfoTable = (props) => {
    const { data } = props;

    // Posting sample data from the collection along with their token hashes
    return (
        <div className="erc721-collection-data-table col-md-9 ml-sm-auto col-lg-10 px-md-4">
            <h5><b>Sample Collection Data</b></h5>
            <table style={{border: '1px solid black'}}>
                <thead style={{border: '1px solid black'}}>
                <tr style={{border: '1px solid black'}}>
                    <th style={{border: '1px solid black'}} scope="col">Token Hash</th>
                    <th style={{border: '1px solid black'}} scope="col">Token Address</th>
                    <th style={{border: '1px solid black'}} scope="col">Token Id</th>
                    <th style={{border: '1px solid black'}} scope="col">Amount</th>
                    <th style={{border: '1px solid black'}} scope="col">Contract Type</th>
                    <th style={{border: '1px solid black'}} scope="col">Symbol</th>
                </tr>
                </thead>
                <tbody>
                    {
                        data.map(record => {
                            return (
                                <tr style={{border: '1px solid black'}}>
                                    <td style={{border: '1px solid black', fontSize: '18px'}}>{record.token_hash}</td>
                                    <td style={{border: '1px solid black', fontSize: '18px'}}>{record.token_address}</td>
                                    <td style={{border: '1px solid black', fontSize: '18px'}}>{record.token_id}</td>
                                    <td style={{border: '1px solid black', fontSize: '18px'}}>{record.amount}</td>
                                    <td style={{border: '1px solid black', fontSize: '18px'}}>{record.contract_type}</td>
                                    <td style={{border: '1px solid black', fontSize: '18px'}}>{record.symbol}</td>
                                </tr>
                            )
                        })
                    }
                </tbody>
            </table>
        </div>  
    )
}

export default ERC721CollectionDataInfoTable;