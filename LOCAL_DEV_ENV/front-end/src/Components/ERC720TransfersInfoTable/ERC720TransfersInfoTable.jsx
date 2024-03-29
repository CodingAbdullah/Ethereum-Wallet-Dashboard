import React from 'react';
import Badge from '../Badge/Badge';

const ERC720TransfersInfoTable = (props) => {
    const { data, address } = props;

    let location = window.location.pathname; // Path name for the style of table display

    return (
        <div class={ location === '/erc20-holdings' ? "p-3" : "" } style={{ overflowX: 'scroll', paddingBottom: '2rem' }}>
            <table style={{border: '1px solid black'}}>
                <thead style={{border: '1px solid black'}}>
                <tr style={{border: '1px solid black'}}>
                    <th style={{border: '1px solid black'}} scope="col">Date</th>
                    <th style={{border: '1px solid black'}} scope="col">From</th>
                    <th style={{border: '1px solid black'}} scope="col">To</th>
                    { address !== null ? <th style={{border: '1px solid black'}} scope="col">Direction</th> : null }                   
                    <th style={{border: '1px solid black'}} scope="col">Value In WEI (ERC20Quantity)</th>
                </tr>
                </thead>
                <tbody>
                    { data.map((record, key) => {
                        // Display information, format date display
                            return (
                                <tr id={key} style={{border: '1px solid black'}}>
                                    <td style={{border: '1px solid black'}}>{record.block_timestamp.split("T")[0]}</td>
                                    <td style={{border: '1px solid black'}}>{record.from_address}</td>
                                    <td style={{border: '1px solid black'}}>{record.to_address}</td>
                                    { address !== null ? 
                                        <td style={{ border: '1px solid black', fontSize: '11px' }}>
                                            { address.toLowerCase() === record.to_address ? 
                                                <Badge type="IN" /> : 
                                                <Badge type="OUT" />
                                            }
                                        </td> : 
                                        null 
                                    }
                                    <td style={{border: '1px solid black'}}>
                                        { address != null ?
                                            record.value :
                                            (record.value*(1/1000000000000000000))
                                        }
                                    </td>
                                </tr>
                            )
                        }
                    )}
                </tbody>
            </table>
        </div>  
    )
}

export default ERC720TransfersInfoTable;