import React from 'react';

const ENSTransferByNameInfoTable = (props) => {
    const { data } = props;
    
    // Display transfers from API call
    return (            
        <div>
            { 
                <table style={{border: '1px solid black', fontSize: '10px'}}>
                    <thead style={{border: '1px solid black', fontSize: '10px'}}>
                        <tr style={{border: '1px solid black', fontSize: '10x'}}>
                            <th style={{border: '1px solid black', fontSize: '10px'}} scope="col">Time Stamp</th>
                            <th style={{border: '1px solid black', fontSize: '10px'}} scope="col">ENS</th>
                            <th style={{border: '1px solid black', fontSize: '10px'}} scope="col">Transaction Hash</th>
                            <th style={{border: '1px solid black', fontSize: '10px'}} scope="col">Category</th>
                            <th style={{border: '1px solid black', fontSize: '10px'}} scope="col">From</th>
                            <th style={{border: '1px solid black', fontSize: '10px'}} scope="col">To</th>
                        </tr>
                    </thead>
                    <tbody>
                            {
                                data.information.results.map(record => {
                                    return (
                                        <tr style={{border: '1px solid black', fontSize: '10px'}}>
                                            <td style={{border: '1px solid black', fontSize: '10px'}}>{record.timestamp.split("Z")[0]}</td>
                                            <td style={{border: '1px solid black', fontSize: '10px'}}>{record.ens_name}</td>
                                            <td style={{border: '1px solid black', fontSize: '10px'}}>{record.transaction_hash}</td>
                                            <td style={{border: '1px solid black', fontSize: '10px'}}>{record.category}</td>
                                            <td style={{border: '1px solid black', fontSize: '10px'}}>{record.from === null ? "null" : record.from}</td>
                                            <td style={{border: '1px solid black', fontSize: '10px'}}>{record.to === null ? "null" : record.to}</td>
                                        </tr>
                                    )
                                })
                            }
                    </tbody>
                </table> 
            }
        </div>
    )
}

export default ENSTransferByNameInfoTable;