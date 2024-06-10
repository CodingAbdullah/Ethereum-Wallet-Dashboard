import React from 'react';
import './Navbar.css';

const Navbar = () => {

    const isFreeVersion = false; // Check flag to determine what version of the CoinGecko API is in use

    // Styles for Navbar
    const styles = {
        navLinkColor: {
            color: 'white'
        },
        navTitleLinkAttributes : {
            color: 'white',
            fontWeight: 'bold'
        },
        buttonAttributes : {
            backgroundColor: 'white'
        }
    }

    return (
        <div>
            <nav className="navbar navbar-expand-lg navbar-light bg-dark">
                <div className="container-fluid">
                    <a style={ styles.navTitleLinkAttributes } className="p-2 navbar-brand" href="/">Ethereum Wallet Dashboard</a>
                    <button style = { styles.buttonAttributes } className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <a style={ styles.navLinkColor } className="nav-link" aria-current="page" href="/about">About</a>
                            </li>
                            <li className="nav-item dropdown">
                                <a style={ styles.navLinkColor } className="nav-link dropdown-toggle" href="#" id="prices" role="button"
                                data-bs-toggle="dropdown" aria-expanded="false">
                                    Prices
                                </a>
                                <ul className="dropdown-menu" aria-labelledby="prices">
                                    {
                                        isFreeVersion ? null :                            
                                            <li className="nav-item">
                                                <a style={ styles.navLinkColor } className="nav-link" href="/prices">Prices</a>
                                            </li>
                                    }                                    
                                    <li><a className="dropdown-item" href="/erc20-token-prices">ERC20 Token Prices</a></li>
                                </ul>
                            </li>
                            <li className="nav-item dropdown">
                                <a style={ styles.navLinkColor } className="nav-link dropdown-toggle" href="#" id="holdings" role="button"
                                data-bs-toggle="dropdown" aria-expanded="false">
                                    Token Holdings
                                </a>
                                <ul className="dropdown-menu" aria-labelledby="holdings">
                                    <li><a className="dropdown-item" href="/erc20-holdings">ERC20 Holdings</a></li>
                                    <li><a className="dropdown-item" href="/erc721-holdings">ERC721 Holdings</a></li>
                                </ul>
                            </li>
                            <li className="nav-item dropdown">
                                <a style={ styles.navLinkColor } className="nav-link dropdown-toggle" href="#" id="lookups" role="button"
                                data-bs-toggle="dropdown" aria-expanded="false">
                                    Token Lookups
                                </a>
                                <ul className="dropdown-menu" aria-labelledby="lookups">
                                    <li><a className="dropdown-item" href="/ens-lookup">ENS</a></li>
                                    <li><a className="dropdown-item" href="/erc721-lookups">ERC721 Token Lookups</a></li>
                                </ul>
                            </li>
                            <li className="nav-item dropdown">
                                <a style={ styles.navLinkColor } className="nav-link dropdown-toggle" href="#" id="dashboards" role="button"
                                data-bs-toggle="dropdown" aria-expanded="false">
                                    Layer 2 Dashboards
                                </a>
                                <ul className="dropdown-menu" aria-labelledby="dashboards">
                                    <li><a className="dropdown-item" target="_blank" href="https://arbitrum-aws.d1pqf6famiyi96.amplifyapp.com/">Arbitrum</a></li>
                                    <li><a className="dropdown-item" target="_blank" href="https://optimism-aws.d22w7ozmz21la.amplifyapp.com/">Optimism</a></li>                                    
                                    <li><a className="dropdown-item" target="_blank" href="https://aws.d2n4l9is533l0n.amplifyapp.com/">Polygon</a></li>
                                </ul>
                            </li>
                            <li className="nav-item">
                                <a style={ styles.navLinkColor } className="nav-link" href="/gas-tracker">Gas Station</a>
                            </li>
                            <li className="nav-item dropdown">
                                <a style={ styles.navLinkColor } className="nav-link dropdown-toggle" href="#" id="analytics" role="button"
                                data-bs-toggle="dropdown" aria-expanded="false">
                                    Analytics
                                </a>
                                <ul className="dropdown-menu" aria-labelledby="analytics">
                                    <li><a className="dropdown-item" href="/collections">Token Analytics</a></li>
                                    <li><a className="dropdown-item" href="/walletAnalytics">Wallet Analytics</a></li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </div>
    );
}

export default Navbar;