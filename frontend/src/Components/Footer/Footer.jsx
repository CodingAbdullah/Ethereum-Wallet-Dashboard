import React from 'react';
import '../Footer/Footer.css';

const Footer = () => {
    
    const statement = "Copyright "  + new Date().getFullYear() + ". Powered By ";

    return (
            <div class="footer-container container">
                <footer class="footer col-md-9 ml-sm-auto col-lg-10 px-md-4">
                    <div class="container">
                        <p className="copyright-paragraph" >APIs Powered By:  
                            <a style={{ color:'black' }} href="https://opensea.io/"><img style={{ marginLeft: '0.25rem', marginRight: '0.15rem' }} src={require("../../assets/images/opensea.png")} width="25" height="25" alt="logo" />Opensea </a><span style={{ marginLeft: '0.25rem', marginRight: '0.25rem' }}><b>|</b></span>
                            <a style={{ color:'black' }} href="https://www.coingecko.com"><img style={{ marginRight: '0.15rem' }} src={require("../../assets/images/coingecko.png")} width="25" height="25" alt="logo" />Coin Gecko</a><span style={{ marginLeft: '0.25rem', marginRight: '0.25rem' }}><b>|</b></span>
                            <a style={{ color:'black' }} href="https://etherscan.io/"><img src={require("../../assets/images/etherscan.png")} width="25" height="25" alt="logo" />Etherscan</a><span style={{ marginLeft: '0.25rem', marginRight: '0.25rem' }}><b>|</b></span> 
                            <a style={{ color:'black' }} href="https://ens.domains/"><img src={require("../../assets/images/ens.png")} width="25" height="25" alt="logo" />ENS</a></p>
                        <p className="copyright-paragraph" >{statement} <a style={{ color: 'black' }} href="https://reactjs.org/">React</a><img className="react-logo" src={require("../../assets/images/logo.svg").default} alt="logo" /></p>
                    </div>
                </footer>
            </div>
    )
}

export default Footer;