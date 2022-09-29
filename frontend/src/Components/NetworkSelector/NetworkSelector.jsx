import React from 'react';
import './NetworkSelector.css';

const NetworkSelector = (props) => {
    // Add in options for Mainnet, Kovan, Goerli, Rinkeby, Ropsten, Sepolia testnets. L2 ---> Polygon and their testnet, Mumbai
    return (
        <main role="main">            
            <label style={{ marginTop: '3rem' }}>
                <p style={{ marginBottom: '0.5rem' }}>Network Selector (<b>mainnet</b> by default)</p>
            </label>
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
                <input className="form-check-input" name='network-type' type="radio" onChange={ props.blockchainNetwork } value="sepolia" />
                <label id='network-label' class="form-check-label">Sepolia Testnet</label>
                <input className="form-check-input" name='network-type' type="radio" onChange={ props.blockchainNetwork } value="polygon" />
                <label id='network-label' class="form-check-label">Polygon Mainnet</label>
                <input className="form-check-input" name='network-type' type="radio" onChange={ props.blockchainNetwork } value="polygon-mumbai" />
                <label id="network-label">Polygon Mumbai Testnet</label>
            </div>
        </main>
    )
}

export default NetworkSelector;