import React from 'react';

const ENSTransferByNameInfoTable = (props) => {
    const { data } = props;
    
    // Display transfers from API call
    return (            
        <div style={{marginLeft: '1rem'}}>
            { 
                <table style={{border: '1px solid black', fontSize: '10.5px'}}>
                    <thead style={{border: '1px solid black', fontSize: '10.5px'}}>
                        <tr style={{border: '1px solid black', fontSize: '10.5x'}}>
                            <th style={{border: '1px solid black', fontSize: '10.5px'}} scope="col">Time Stamp</th>
                            <th style={{border: '1px solid black', fontSize: '10.5px'}} scope="col">Transaction Hash</th>
                            <th style={{border: '1px solid black', fontSize: '10.5px'}} scope="col">Category</th>
                            <th style={{border: '1px solid black', fontSize: '10.5px'}} scope="col">From</th>
                            <th style={{border: '1px solid black', fontSize: '10.5px'}} scope="col">To</th>
                        </tr>
                    </thead>
                    <tbody>
                            {
                                data.information.results.map((record, key) => {
                                    return (
                                        <tr id={key} style={{border: '1px solid black', fontSize: '10.5px'}}>
                                            <td style={{border: '1px solid black', fontSize: '10.5px'}}>{record.timestamp.split("Z")[0]}</td>
                                            <td style={{border: '1px solid black', fontSize: '10.5px'}}>{record.transaction_hash}</td>
                                            <td style={{border: '1px solid black', fontSize: '10.5px'}}>{record.category}</td>
                                            <td style={{border: '1px solid black', fontSize: '10.5px'}}>{record.from === null ? "null" : record.from}</td>
                                            <td style={{border: '1px solid black', fontSize: '10.5px'}}>{record.to === null ? "null" : record.to}</td>
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