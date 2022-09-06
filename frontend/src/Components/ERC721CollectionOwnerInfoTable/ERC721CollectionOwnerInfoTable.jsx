import React from 'react';

const ERC721CollectionOwnerInfoTable = (props) => {
    const { data } = props;

    const uniqueOwnerList = new Set();

    for (var i = 0; i < data.length; i++){
        uniqueOwnerList.add(data[i].owner_of);
    }

    // Display Owner data from an NFT collection
    return (
        <div className="erc721-collection-data-table col-md-9 ml-sm-auto col-lg-10 px-md-4">
            <h5><b>NFT Collection Owner Data</b></h5>
            <h6><b>Unique Owners within Collection: {uniqueOwnerList.size}</b></h6>
            <table style={{border: '1px solid black'}}>
                <thead style={{border: '1px solid black'}}>
                <tr style={{border: '1px solid black'}}>
                    <th style={{border: '1px solid black'}} scope="col">Owner</th>
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
                                    <td style={{border: '1px solid black', fontSize: '17px'}}>{record.owner_of}</td>
                                    <td style={{border: '1px solid black', fontSize: '17px'}}>{record.token_address}</td>
                                    <td style={{border: '1px solid black', fontSize: '17px'}}>{record.token_id}</td>
                                    <td style={{border: '1px solid black', fontSize: '17px'}}>{record.amount}</td>
                                    <td style={{border: '1px solid black', fontSize: '17px'}}>{record.contract_type}</td>
                                    <td style={{border: '1px solid black', fontSize: '17px'}}>{record.symbol}</td>
                                </tr>
                            )
                        })
                    }
                </tbody>
            </table>
        </div>
    )

}

export default ERC721CollectionOwnerInfoTable;