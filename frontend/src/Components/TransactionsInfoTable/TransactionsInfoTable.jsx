import React from 'react';
import Badge from '../Badge/Badge';

const TransactionsInfoTable = (props) => {
    const { data, walletAddress } = props; // Retrieving data from transactions page

    return (
        <div className="transactions-data-table">
            <table style={{border: '1px solid black'}}>
                    <thead style={{border: '1px solid black'}}>
                        <tr style={{border: '1px solid black'}}>
                            <th style={{border: '1px solid black', fontSize: '11px'}} scope="col">Block Number</th>
                            <th style={{border: '1px solid black', fontSize: '11px'}} scope="col">Time Stamp</th>
                            <th style={{border: '1px solid black', fontSize: '11px'}} scope="col">From</th>
                            <th style={{border: '1px solid black', fontSize: '11px'}} scope="col">To</th>
                            <th style={{border: '1px solid black', fontSize: '11px'}} scope="col">Direction</th>
                            <th style={{border: '1px solid black', fontSize: '11px'}} scope="col">Value</th>
                            <th style={{border: '1px solid black', fontSize: '11px'}} scope="col">Gas</th>
                        </tr>
                    </thead>
                    <tbody style={{border: '1px solid black'}}>
                        {
                            data.map(record => {
                                return (
                                    <tr style={{border: '1px solid black'}}>
                                        <td style={{border: '1px solid black', fontSize: '11px'}}>{record.blockNumber}</td>
                                        <td style={{border: '1px solid black', fontSize: '11px'}}>{new Date(record.timeStamp*1000).toString().split("GMT")[0].trim() +"-EST"}</td>
                                        <td style={{border: '1px solid black', fontSize: '11px'}}>{record.from}</td>
                                        <td style={{border: '1px solid black', fontSize: '11px'}}>{record.to}</td>
                                        <td style={{border: '1px solid black', fontSize: '11px'}}>{walletAddress.toLowerCase() === record.to ? <Badge type="IN" /> : <Badge type="OUT" />}</td>
                                        <td style={{border: '1px solid black', fontSize: '11px'}}>{(record.value*(1/1000000000000000000)).toPrecision(4) + " ETH"}</td>
                                        <td style={{border: '1px solid black', fontSize: '11px'}}>{record.gas}</td>
                                    </tr>
                                )
                            }) 
                        }                             
                    </tbody>
            </table>
        </div>
    )
}

export default TransactionsInfoTable;