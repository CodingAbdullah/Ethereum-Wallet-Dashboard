import React from 'react';
import '../Footer/Footer.css';

const Footer = () => {
    
    const statement = "Copyright "  + new Date().getFullYear() + ". Powered By ";

    return (
            <div class="footer-container container">
                <footer class="footer col-md-9 ml-sm-auto col-lg-10 px-md-4">
                    <div class="container">
                        <p style={{ marginLeft: '1rem' }}className="copyright-paragraph"> <a style={{ color: 'black' }} href="https://kingabdul.eth.xyz/">About Me</a></p>
                        <p className="copyright-paragraph" >Powered By:  
                            <a style={{ color:'black' }} href="https://moralis.io/"><img style={{ marginLeft: '0.25rem', marginRight: '0.15rem' }} src={require("../../assets/images/moralis.png")} width="25" height="25" alt="logo" />Moralis</a><span style={{ marginLeft: '0.25rem', marginRight: '0.25rem' }}><b>|</b></span>
                            <a style={{ color:'black' }} href="https://www.coingecko.com"><img style={{ marginRight: '0.15rem' }} src={require("../../assets/images/coingecko.png")} width="25" height="25" alt="logo" />Coin Gecko</a><span style={{ marginLeft: '0.25rem', marginRight: '0.25rem' }}><b>|</b></span>
                            <a style={{ color:'black' }} href="https://etherscan.io/"><img src={require("../../assets/images/etherscan.png")} width="25" height="25" alt="logo" />Etherscan</a><span style={{ marginLeft: '0.25rem', marginRight: '0.25rem' }}><b>|</b></span> 
                            <a style={{ color:'black' }} href="https://ens.domains/"><img src={require("../../assets/images/ens.png")} width="25" height="25" alt="logo" />ENS</a><span style={{ marginLeft: '0.25rem', marginRight: '0.25rem' }}><b>|</b></span> 
                            <a style={{ color:'black' }} href="https://opensea.io/"><img style={{ marginRight: '0.15rem' }} src={require("../../assets/images/opensea.png")} width="25" height="25" alt="logo" />Opensea</a></p>
                        <p style={{ marginLeft: '1rem' }}className="copyright-paragraph" >{statement} <a style={{ color: 'black' }} href="https://reactjs.org/">React</a><img className="react-logo" src={require("../../assets/images/logo.svg").default} alt="logo" /></p>
                    </div>
                </footer>
            </div>
    )
}

export default Footer;