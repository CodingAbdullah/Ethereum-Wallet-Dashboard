import React, { useState } from 'react';
import './NetworkSelector.css';

const NetworkSelector = () => {
    const [selectedValue, updateSelectedValue] = useState('eth'); // Update network value

    // Add in options for Mainnet, Goerli, Sepolia testnets. L2 ---> Polygon and their testnet, Mumbai
    return (
        <div className='network-selector'>
            <label>{selectedValue}</label>
            <div className="form-check">
                <input className="form-check-input" name='network-type' type="radio" onChange={() => updateSelectedValue('eth')} value="eth" />
                <label className='network-label' class="form-check-label">Ethereum Mainnet</label>
                <input className="form-check-input" name='network-type' type="radio" onChange={() => updateSelectedValue('goerli')} value="goerli" />
                <label className='network-label' class="form-check-label">Goerli Testnet</label>
                <input className="form-check-input" name='network-type' type="radio" onChange={() => updateSelectedValue('sepolia')} value="sepolia" />
                <label className='network-label' class="form-check-label">Sepolia Testnet</label>
                <input className="form-check-input" name='network-type' type="radio" onChange={() => updateSelectedValue('polygon')} value="polygon" />
                <label className='network-label' class="form-check-label">Polygon Mainnet</label>
                <input className="form-check-input" name='network-type' type="radio" onChange={() => updateSelectedValue('polygon-mumbai')} value="polygon-mumbai" />
                <label className="network-label">Polygon Mumbai Testnet</label>
            </div>
        </div>
    )
}

export default NetworkSelector;