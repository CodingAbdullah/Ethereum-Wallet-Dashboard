import React from 'react';
import './NetworkSelector.css';

const NetworkSelector = (props) => {
    // Add in options for Mainnet, Kovan, Goerli, Rinkeby, Ropsten, Sepolia testnets. L2 ---> Polygon and their testnet, Mumbai
    let optionsValue = null;
    let location = window.location.pathname; // On select pathnames, modify the name of networks available to user

    if (location ==='/erc20-token-prices' || location === '/collections/erc720-collection' || location === '/collections/erc721-collection') {
        optionsValue = (
            <div style={{ marginLeft: '2.0rem' }} className="form-check">
                <input className="form-check-input" name='network-type' type="radio" onChange={ props.blockchainNetwork } value="eth" />
                <label id='network-label' class="form-check-label">Ethereum Mainnet</label>
                <br />
                <input className="form-check-input" name='network-type' type="radio" onChange={ props.blockchainNetwork } value="polygon" />
                <label id='network-label' class="form-check-label">Polygon Mainnet</label>
            </div>
        )   
    }
    else {
        optionsValue = (
            <div className="form-check">
                <input className="form-check-input" name='network-type' type="radio" onChange={ props.blockchainNetwork } value="eth" />
                <label id='network-label' class="form-check-label">Ethereum Mainnet</label>
                <input className="form-check-input" name='network-type' type="radio" onChange={ props.blockchainNetwork } value="kovan" />
                <label id='network-label' class="form-check-label">Kovan Testnet</label>
                <input className="form-check-input" name='network-type' type="radio" onChange={ props.blockchainNetwork } value="goerli" />
                <label id='network-label' class="form-check-label">Goerli Testnet</label>
                <input className="form-check-input" name='network-type' type="radio" onChange={ props.blockchainNetwork } value="rinkeby" />
                <label id='network-label' class="form-check-label">Rinkeby Testnet</label>
                <br />
                <input className="form-check-input" name='network-type' type="radio" onChange={ props.blockchainNetwork } value="ropsten" />
                <label id='network-label' class="form-check-label">Ropsten Testnet</label>
                <input className="form-check-input" name='network-type' type="radio" onChange={ props.blockchainNetwork } value="sepolia" />
                <label id='network-label' class="form-check-label">Sepolia Testnet</label>
            </div>
        )
    }
    return (
        <main role="main">            
            <label style={{ marginTop: '3rem' }}>
                <p style={{ marginBottom: '0.5rem' }}>Network Selector (<b>mainnet</b> by default)</p>
            </label>
            {optionsValue}
        </main>
    )
}

export default NetworkSelector;