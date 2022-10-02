import React from 'react';

const HomePageDescriptionSection = (props) => {

    // Decoupled from home page to make components leaner, functions passed down from parent as props
    return (
        <div class="jumbotron">
            <div class="container">
                <h1 class="display-5" style={{ marginBottom: '2rem' }}>Welcome!</h1>
                <p>Your one-stop shop to check the bearings of anything Ethereum! Anything you need to investigate on the blockchain is provided to you ready-made for free. We do the work for you, so you don't have to. Just plug and play!</p> 
                <p>Deep dive into collections, wallet information, price action, ENS and much more! Here is a link to all <b>EVM-compatible</b> chains and their respective IDs:
                    <a style={{ color: 'black', fontStyle: 'italic' }} href="https://chainlist.org" target="_blank" rel="noreferrer"><b> ChainList</b></a>
                </p> 
                <p>Please note that all activity documented here is on the <b>mainnet</b> network, by default. Some information might not be available on certain networks. 
                <br />
                <b>ERC-1155</b> token related data is also not available.</p>
                <p> To view information on any <b>testnet</b>, please visit the <b>Wallet/Testnet</b> item on the left sidebar. 
                    There, you can decide which network to view wallet information from (<b>mainnet</b> by default).
                </p>
                <p>Enter the <b>public</b> address below (42-digit hex code) of a wallet to track activity, cheers!</p>
                <form style={{ marginTop: '3rem'}} onSubmit={props.form}>
                    <input class="form-control mr-sm-2" type="search" placeholder="Enter Wallet Address (0xa2e3se4u5F...)" max="42" min="42" aria-label="Search" onChange={props.updatingAddress} required />
                    <button class="btn btn-outline-success wallet-search-button" type="submit">Search &raquo;</button>
                </form>
            </div>
        </div>
    )

}

export default HomePageDescriptionSection;