import React from 'react';

const TransactionBalanceSection = (props) => {
    const { address, coinAction, amountValue, blockchainNetwork } = props;

    // Extract values for matic/ethereum networks. Convert from wei to eth if value is eth otherwise, keep it the same
    return (
        <div style={{ marginLeft: 'auto', marginRight: 'auto', width: '50%' }}>
            <h4 style={{ marginTop: '1.5rem' }}>
                <b>{"Account: " + address}</b>
            </h4>
            {
                    blockchainNetwork.split('-')[0] === 'polygon' ?
                    (        
                        <>
                            <h5>
                                <b>{ "Matic Balance: " + ( amountValue * (1/1000000000000000000)) + " MATIC (@ $" + ( coinAction.information['matic-network'].usd ).toFixed(2) + " USD/MATIC)" }</b>
                            </h5>
                            <h6>
                                <b>{ "Amount in USD: $" + ( amountValue * (1/1000000000000000000)) * ( coinAction.information['matic-network'].usd ).toFixed(2) + " USD" }</b>
                            </h6> 
                        </>
                    ):
                    (
                        <>
                            <h5>
                                <b>{ "ETH Balance: " + ( amountValue * (1/1000000000000000000)) + " ETH (@ $" + ( coinAction.information.ethereum.usd ).toFixed(2) + " USD/ETH)" }</b>
                            </h5>
                            <h6>
                                <b>{ "Amount in USD: $" + (( amountValue * (1/1000000000000000000))*( coinAction.information.ethereum.usd )).toFixed(2) + " USD" }</b>
                            </h6>
                        </>
                    )
                }         
        </div>
    )
}

export default TransactionBalanceSection;