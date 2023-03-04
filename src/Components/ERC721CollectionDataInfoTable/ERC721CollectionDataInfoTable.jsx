import React from 'react';

const ERC721CollectionDataInfoTable = (props) => {
    const { data } = props;

    let offSetData = [];

    for (var i = 0 ; i < Math.floor( data.length / 4 ); i ++) {
        offSetData.push(data[i]); // Only take a sample of data to display
    }

    // Posting sample data from the collection along with their token hashes
    return (
        <div className="erc721-collection-data-table p-3" style={{ overflowX: 'scroll', paddingBottom: '2rem' }}>
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
                        offSetData.map((record, key) => {
                            return (
                                <tr id={key} style={{border: '1px solid black'}}>
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