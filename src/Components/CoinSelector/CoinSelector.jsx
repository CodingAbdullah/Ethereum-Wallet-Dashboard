import React from 'react';
import { useSelector } from 'react-redux';

const CoinSelector = (props) => {
    const coin = useSelector(state => state.coinSelection.coin);

    return (
        <div>
            <label style={{ marginRight: '0.5rem' }}>Select a coin: </label>
            <select style={{ marginTop: '2rem' }} onChange={ props.changeValue } name="coinSelector">
                <option selected={ coin === 'algorand' ? true: false } value="algorand">Algorand</option>
                <option selected={ coin === 'avalanche-2' ? true: false } value="avalanche-2">Avalanche</option>
                <option selected={ coin === 'binancecoin' ? true: false } value="binancecoin">Binance</option>
                <option selected={ coin === 'bitcoin' ? true: false } value="bitcoin">Bitcoin</option>
                <option selected={ coin === 'cardano' ? true: false } value="cardano">Cardano</option>
                <option selected={ coin === 'chainlink' ? true: false } value="chainlink">Chainlink</option>
                <option selected={ coin === 'dogecoin' ? true: false } value="dogecoin">Dogecoin</option>
                <option selected={ coin === 'ethereum' ? true: false } value="ethereum">Ethereum</option>
                <option selected={ coin === 'litecoin' ? true: false } value="litecoin">Litecoin</option>
                <option selected={ coin === 'matic-network' ? true: false } value="matic-network">Polygon</option>
                <option selected={ coin === 'polkadot' ? true: false } value="polkadot">Polkadot</option>
                <option selected={ coin === 'ripple' ? true: false } value="ripple">Ripple</option>
                <option selected={ coin === 'solana' ? true: false } value="solana">Solana</option>
                <option selected={ coin === 'stellar' ? true: false } value="stellar">Stellar</option>
                <option selected={ coin === 'uniswap' ? true: false } value="uniswap">Uniswap</option>
            </select>
        </div>
    )
}

export default CoinSelector;