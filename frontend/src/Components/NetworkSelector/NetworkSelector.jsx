import React, { useState } from 'react';
import './NetworkSelector.css';

const NetworkSelector = () => {
    const [selectedValue, updateSelectedValue] = useState('eth'); // Update network value

    // Add in options for Mainnet, Kovan, Goerli, Rinkeby, Ropsten, Sepolia testnets. L2 ---> Polygon and their testnet, Mumbai
    return (
        <main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-md-4">            
            <label>{selectedValue}</label>
            <br/>
            <label>
                <b>Network Selector</b>
            </label>
            <div className="form-check">
                <input className="form-check-input" name='network-type' type="radio" onChange={() => updateSelectedValue('eth')} value="eth" />
                <label id='network-label' class="form-check-label">Ethereum Mainnet</label>
                <input className="form-check-input" name='network-type' type="radio" onChange={() => updateSelectedValue('kovan')} value="kovan" />
                <label id='network-label' class="form-check-label">Kovan Testnet</label>
                <input className="form-check-input" name='network-type' type="radio" onChange={() => updateSelectedValue('goerli')} value="goerli" />
                <label id='network-label' class="form-check-label">Goerli Testnet</label>
                <input className="form-check-input" name='network-type' type="radio" onChange={() => updateSelectedValue('rinkeby')} value="rinkeby" />
                <label id='network-label' class="form-check-label">Rinkeby Testnet</label>
                <br />
                <input className="form-check-input" name='network-type' type="radio" onChange={() => updateSelectedValue('ropsten')} value="ropsten" />
                <label id='network-label' class="form-check-label">Ropsten Mainnet</label>
                <input className="form-check-input" name='network-type' type="radio" onChange={() => updateSelectedValue('sepolia')} value="sepolia" />
                <label id='network-label' class="form-check-label">Sepolia Testnet</label>
                <input className="form-check-input" name='network-type' type="radio" onChange={() => updateSelectedValue('polygon')} value="polygon" />
                <label id='network-label' class="form-check-label">Polygon Mainnet</label>
                <input className="form-check-input" name='network-type' type="radio" onChange={() => updateSelectedValue('polygon-mumbai')} value="polygon-mumbai" />
                <label id="network-label">Polygon Mumbai Testnet</label>
            </div>
        </main>
    )
}

export default NetworkSelector;