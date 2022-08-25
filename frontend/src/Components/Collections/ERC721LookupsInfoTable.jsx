import React from 'react';

const ERC721LookupsInfoTable = (props) => {
    const { data } = props;

    return (
        <div>
            <table style={{border: '1px solid black'}}>
                <thead style={{border: '1px solid black'}}>
                <tr style={{border: '1px solid black'}}>
                    <th style={{border: '1px solid black'}} scope="col">Name</th>
                    <th style={{border: '1px solid black'}} scope="col">Symbol</th>
                    <th style={{border: '1px solid black'}} scope="col">Owner</th>
                    <th style={{border: '1px solid black'}}scope="col">Token Address</th>
                    <th style={{border: '1px solid black'}} scope="col">Token Id</th>
                    <th style={{border: '1px solid black'}} scope="col">Contract Type</th>
                    <th style={{border: '1px solid black'}}scope="col">Amount</th>
                    <th style={{border: '1px solid black'}} scope="col">NFT Link</th>
                </tr>
                </thead>
                <tbody>
                    { // Formatting the table rows to show data
                        <tr>
                            <td style={{border: '1px solid black'}}>{data.name}</td>
                            <td style={{border: '1px solid black'}}>{data.symbol}</td>
                            <td style={{border: '1px solid black'}}>{data.owner_of}</td>
                            <td style={{border: '1px solid black'}}>{data.token_address}</td>
                            <td style={{border: '1px solid black'}}>{data.token_id}</td>
                            <td style={{border: '1px solid black'}}>{data.contract_type}</td>
                            <td style={{border: '1px solid black'}}>{data.amount}</td>
                            <td style={{border: '1px solid black'}}><a href={"https://opensea.io/assets/ethereum/" + data.token_address + "/" + data.token_id} target="_blank" rel="noreferrer">Link</a></td>
                        </tr>
                    }   
                </tbody>
            </table>
        </div>  
    )
}

export default ERC721LookupsInfoTable;