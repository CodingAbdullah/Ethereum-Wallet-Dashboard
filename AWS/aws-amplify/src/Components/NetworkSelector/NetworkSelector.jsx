import React from 'react';
import './NetworkSelector.css';

const NetworkSelector = (props) => {
    // Add in options for Mainnet, Kovan, Goerli, Rinkeby, Ropsten, Sepolia testnets. L2 ---> Polygon and their testnet, Mumbai

    let optionsValue = null;
    let location = window.location.pathname; // On select pathnames, modify the name of networks available to user

    if (location !=='/erc20-token-prices' && location !== '/collections/erc720-collection' && location !== '/collections/erc721-collection') {
        optionsValue = (
            <select onChange={ props.blockchainNetwork } className="form-select" aria-label="Default select example">
                <option selected value="eth">Ethereum Mainnet</option>
                <option value="sepolia">Sepolia Testnet</option>
                <option value="holesky">Holesky Testnet</option>
            </select>
        )
    }
    return (
        <main style={{ marginLeft: 'auto', marginRight: 'auto', width: '50%' }} role="main">            
            <label style={{ marginTop: '3rem' }}>
                <p style={{ marginBottom: '0.5rem' }}>Network Selector (<b>mainnet</b> by default)</p>
            </label>
            { optionsValue }
        </main>
    )
}

export default NetworkSelector;