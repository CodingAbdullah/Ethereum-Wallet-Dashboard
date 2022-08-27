import React from 'react';

const ERC720HoldingsInfoTable = (props) => {
    const { data } = props;

    return (
        <div className="col-md-9 ml-sm-auto col-lg-10 px-md-4">
            <table style={{border: '1px solid black'}}>
                <thead style={{border: '1px solid black'}}>
                <tr style={{border: '1px solid black'}}>
                    <th style={{border: '1px solid black'}} scope="col">Name</th>
                    <th style={{border: '1px solid black'}} scope="col">Token Address</th>
                    <th style={{border: '1px solid black'}} scope="col">Symbol</th>
                    <th style={{border: '1px solid black'}} scope="col">Balance</th>
                </tr>
                </thead>
                <tbody>
                    { data.map(record => {

                        if (record.name === null){ // Conditional Rendering.. no null names to be displayed
                            return null;
                        }
                        else {
                            return (
                                <tr style={{border: '1px solid black'}}>
                                    <td style={{border: '1px solid black'}}>{record.name}</td>
                                    <td style={{border: '1px solid black'}}>{record.token_address}</td>
                                    <td style={{border: '1px solid black'}}>{record.symbol}</td>
                                    <td style={{border: '1px solid black'}}>{record.balance}</td>
                                </tr>
                            )
                        }
                    })}
                </tbody>
            </table>
        </div>  
    )
}

export default ERC720HoldingsInfoTable;