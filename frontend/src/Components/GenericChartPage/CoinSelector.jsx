import React from 'react';

const CoinSelector = (props) => {

    return (
        <div>
            <label style={{marginRight: '0.5rem'}}>Select a coin: </label>
            <select style={{marginTop: '2rem'}} onChange={props.changeValue} name="coinSelector">
                <option value="avalanche-2">Avalanche</option>
                <option value="binancecoin">Binance</option>
                <option value="binance-usd">Binance USD</option>
                <option value="bitcoin">Bitcoin</option>
                <option value="cardano">Cardano</option>
                <option value="dai">Dai</option>
                <option value="dogecoin">Dogecoin</option>
                <option value="ethereum">Ethereum</option>
                <option value="matic-network">Polygon</option>
                <option value="solana">Solana</option>
                <option value="shiba-inu">Shiba Inu</option>
                <option value="ripple">Ripple</option>
                <option value="polkadot">Polkadot</option>
                <option value="uniswap">Uniswap</option>
                <option value="usd">USD</option>
            </select>
        </div>
    )
}

export default CoinSelector;