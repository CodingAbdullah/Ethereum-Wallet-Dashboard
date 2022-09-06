import React from 'react';
import Badge from '../Badge/Badge';

const ERC721TransfersInfoTable = (props) => {
    const { data, address } = props;

    return (
        <div style={{marginLeft: '15rem'}}>
            <table style={{border: '1px solid black'}}>
                <thead style={{border: '1px solid black'}}>
                <tr style={{border: '1px solid black'}}>
                    <th style={{border: '1px solid black'}} scope="col">Date</th>
                    <th style={{border: '1px solid black'}} scope="col">Token Address</th>
                    <th style={{border: '1px solid black'}} scope="col">ID</th>
                    <th style={{border: '1px solid black'}} scope="col">Direction</th>                    
                    <th style={{border: '1px solid black'}} scope="col">From</th>
                    <th style={{border: '1px solid black'}} scope="col">To</th>
                </tr>
                </thead>
                <tbody>
                    { data.map(record => {
                        // Display information, format date display
                            return (
                                <tr style={{border: '1px solid black'}}>
                                    <td style={{border: '1px solid black', fontSize: '11px'}}>{record.block_timestamp.split("T")[0]}</td>
                                    <td style={{border: '1px solid black', fontSize: '11px'}}>{record.token_address}</td>
                                    <td style={{border: '1px solid black', fontSize: '11px'}}>{record.token_id}</td>
                                    <td style={{border: '1px solid black', fontSize: '11px'}}>{address.toLowerCase() === record.to_address ? <Badge type="IN" /> : <Badge type="OUT" />}</td>
                                    <td style={{border: '1px solid black', fontSize: '11px'}}>{record.from_address}</td>
                                    <td style={{border: '1px solid black', fontSize: '11px'}}>{record.to_address}</td>
                                </tr>
                            )
                        }
                    )}
                </tbody>
            </table>
        </div>  
    )
}

export default ERC721TransfersInfoTable;