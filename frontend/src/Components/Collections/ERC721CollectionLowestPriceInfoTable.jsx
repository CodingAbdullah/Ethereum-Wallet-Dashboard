import React from 'react';

const ERC721CollectionLowestPriceInfoTable = (props) => {
    const { data } = props;

    let ids = ''; // Data manipulation for display
    for (var i = 0 ; i < data.token_ids.length; i++){
        ids += data.token_ids[i] + ", ";
    }
    return (
        <div style={{marginTop: '3rem'}} className="col-md-9 ml-sm-auto col-lg-10 px-md-4">
            <h5><b>Lowest Price in Last 7 Days</b></h5>
            <table style={{border: '1px solid black'}}>
                <thead style={{border: '1px solid black'}}>
                <tr style={{border: '1px solid black'}}>
                    <th style={{border: '1px solid black'}} scope="col">Token Address</th>
                    <th style={{border: '1px solid black'}} scope="col">Buyer</th>
                    <th style={{border: '1px solid black'}} scope="col">Seller</th>
                    <th style={{border: '1px solid black'}} scope="col">Token Id(s)</th>
                    <th style={{border: '1px solid black'}} scope="col">Price</th>
                    <th style={{border: '1px solid black'}} scope="col">Time</th>
                </tr>
                </thead>
                <tbody>
                    <tr style={{border: '1px solid black'}}>
                        <td style={{border: '1px solid black', fontSize: '11px'}}>{data.token_address}</td>
                        <td style={{border: '1px solid black', fontSize: '11px'}}>{data.buyer_address}</td>
                        <td style={{border: '1px solid black', fontSize: '11px'}}>{data.seller_address}</td>
                        <td style={{border: '1px solid black', fontSize: '11px'}}>{ids.substring(0, ids.length - 2)}</td>
                        <td style={{border: '1px solid black', fontSize: '11px'}}>{(data.price*(1/1000000000000000000)).toPrecision(4)} ETH</td>
                        <td style={{border: '1px solid black', fontSize: '11px'}}>{data.block_timestamp.split("T")[0]}</td>
                    </tr>
                </tbody>
            </table>
        </div>  
    )
}

export default ERC721CollectionLowestPriceInfoTable;