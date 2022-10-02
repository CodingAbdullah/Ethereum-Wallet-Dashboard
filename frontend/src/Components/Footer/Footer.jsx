import React from 'react';
import '../Footer/Footer.css';

const Footer = () => {
    
    const statement = "Copyright "  + new Date().getFullYear() + ". Powered By ";

    return (
            <div class="footer footer-container container">
                <footer class="footer col-md-9 ml-sm-auto col-lg-10 px-md-4">
                    <div class="container">
                        <p style={{ marginLeft: '2.5rem', marginTop: '-0.08rem' }} className="copyright-paragraph">
                            <a style={{ color:'black' }} href="https://docs.alchemy.com/reference/" target="_blank" rel="noreferrer"><img style={{ marginRight: '0.15rem' }} src={require("../../assets/images/alchemy.png")} width="25" height="25" alt="logo" />Alchemy</a><span style={{ marginLeft: '0.25rem', marginRight: '0.25rem' }}><b>|</b></span>
                            <a style={{ color:'black' }} href="https://blocknative.com/" target="_blank" rel="noreferrer"><img style={{ marginRight: '0.1rem'}} src={require("../../assets/images/blocknative.png")} width="25" height="25" alt="logo" />Blocknative</a><span style={{ marginLeft: '0.25rem', marginRight: '0.25rem' }}><b>|</b></span> 
                            <a style={{ color:'black' }} href="https://www.coingecko.com" target="_blank" rel="noreferrer"><img style={{ marginRight: '0.15rem' }} src={require("../../assets/images/coingecko.png")} width="25" height="25" alt="logo" />Coin Gecko</a><span style={{ marginLeft: '0.25rem', marginRight: '0.25rem' }}><b>|</b></span>
                            <a style={{ color:'black' }} href="https://etherscan.io/" target="_blank" rel="noreferrer"><img src={require("../../assets/images/etherscan.png")} width="25" height="25" alt="logo" />Etherscan</a><span style={{ marginLeft: '0.25rem', marginRight: '0.25rem' }}><b>|</b></span> 
                            <a style={{ color:'black' }} href="https://moralis.io/" target="_blank" rel="noreferrer"><img style={{ marginRight: '0.15rem' }} src={require("../../assets/images/moralis.png")} width="25" height="25" alt="logo" />Moralis</a><span style={{ marginLeft: '0.25rem', marginRight: '0.25rem' }}><b>|</b></span>
                            <a style={{ color:'black' }} href="https://transpose.io/" target="_blank" rel="noreferrer"><img style={{ marginRight: '0.25rem'}} src={require("../../assets/images/transpose.png")} width="20" height="20" alt="logo" />Transpose</a>
                        </p>
                        <p style={{ marginLeft: '3.5rem', marginTop: '-0.75rem' }} className="copyright-paragraph">{ statement } <a style={{ color: 'black' }} href="https://reactjs.org/">React</a><img className="react-logo" src={require("../../assets/images/logo.svg").default} alt="logo" /></p>
                    </div>
                </footer>
            </div>
    )
}

export default Footer;