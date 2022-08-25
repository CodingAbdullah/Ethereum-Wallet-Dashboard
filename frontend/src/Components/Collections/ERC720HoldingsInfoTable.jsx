import React from 'react';

const ERC720HoldingsInfoTable = (props) => {
    const { data } = props;

    return (
        <div className="col-md-9 ml-sm-auto col-lg-10 px-md-4">
            <table>
                <thead>
                <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Token Address</th>
                    <th scope="col">Symbol</th>
                    <th scope="col">Balance</th>
                </tr>
                </thead>
                <tbody>
                    { data.map(record => {

                        if (record.name === null){ // Conditional Rendering.. no null names to be displayed
                            return null;
                        }
                        else {
                            return (
                                <tr>
                                    <td>{record.name}</td>
                                    <td>{record.token_address}</td>
                                    <td>{record.symbol}</td>
                                    <td>{record.balance}</td>
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