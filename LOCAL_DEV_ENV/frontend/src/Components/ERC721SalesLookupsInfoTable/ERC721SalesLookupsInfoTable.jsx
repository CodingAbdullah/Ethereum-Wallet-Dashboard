import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ERC721SalesLookupInfoTable = (props) => {
    const { address, tokenId } = props;

    // Back end calls to Node server
    const NODE_URL = 'http://localhost:5000/';
    const ERC721_SALES_ENDPOINT = 'erc721-sales-by-id';

    const [ERC721SalesInfo, updateERC721SalesInfo] = useState({
        information: null
    });

    useEffect(() => {
            // Upon render, run API call to collect data using information passed down from parent component, provided it is the mainnet
            const options = {
                method: 'POST',
                mode: 'cors',
                body: JSON.stringify({ address : address, id: tokenId }),
                headers: {
                    'content-type': 'application/json'
                }
            }

            axios.post(NODE_URL + ERC721_SALES_ENDPOINT, options)
            .then(response => {
                updateERC721SalesInfo((prevState) => {
                    return {
                        ...prevState,
                        information: response.data.information
                    }
                });
            })
            .catch(() => {
                updateERC721SalesInfo((prevState) => {
                    return {
                        ...prevState,
                        information: null
                    }
                })
            });
    }, []);

    if (ERC721SalesInfo.information === null){
        return <div>Loading...</div>
    }
    else {
        return (
            <>
                <div className='erc721-sales-lookups-info-table'>
                    <table style={{border: '1px solid black', fontSize: '9px'}}>
                        <thead style={{border: '1px solid black', fontSize: '9px'}}>
                            <tr style={{border: '1px solid black', fontSize: '9px'}}>
                                <th style={{border: '1px solid black', fontSize: '9px'}} scope="col">Transaction Hash</th>
                                <th style={{border: '1px solid black', fontSize: '9px'}} scope="col">Time Stamp</th>
                                <th style={{border: '1px solid black', fontSize: '9px'}} scope="col">Exchange Name-Version</th>
                                <th style={{border: '1px solid black', fontSize: '9px'}} scope="col">ETH Price</th>
                                <th style={{border: '1px solid black', fontSize: '9px'}} scope="col">USD Price</th>
                                <th style={{border: '1px solid black', fontSize: '9px'}} scope="col">Buyer</th>
                                <th style={{border: '1px solid black', fontSize: '9px'}} scope="col">Seller</th>
                            </tr>
                        </thead>
                        <tbody style={{border: '1px solid black', fontSize: '10px'}}>
                            { ERC721SalesInfo.information.results.map((record, key) => {
                                return (
                                        <tr id={key} style={{border: '1px solid black', fontSize: '10px'}}>
                                            <td style={{border: '1px solid black', fontSize: '10px'}}>{record.transaction_hash}</td>
                                            <td style={{border: '1px solid black', fontSize: '10px'}}>{record.timestamp.split("Z")[0]}</td>
                                            <td style={{border: '1px solid black', fontSize: '10px'}}>{record.exchange_name + '-' + record.contract_version}</td>
                                            <td style={{border: '1px solid black', fontSize: '10px'}}>{record.eth_price}</td>
                                            <td style={{border: '1px solid black', fontSize: '10px'}}>{"$" + record.usd_price.toFixed(2)}</td>
                                            <td style={{border: '1px solid black', fontSize: '10px'}}>{record.buyer}</td>
                                            <td style={{border: '1px solid black', fontSize: '10px'}}>{record.seller}</td>
                                        </tr>
                                )
                            })}
                        </tbody>
                    </table>    
                </div>
            </>
        )
    }
}

export default ERC721SalesLookupInfoTable;