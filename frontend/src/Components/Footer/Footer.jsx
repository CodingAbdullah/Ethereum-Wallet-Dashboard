import React from 'react';
import '../Footer/Footer.css';

const Footer = () => {
    
    const statement = "Copyright "  + new Date().getFullYear() + ". Powered By ";

    return (
        <div class="container">
            <footer class="footer">
                <div class="container">
                    <p className="copyright-paragraph" style={{paddingRight: '4.0rem'}}>APIs Powered By:  
                        <a style={{color:'black'}} href="https://opensea.io/"><img style={{marginLeft: '0.25rem'}} src={require("../../assets/images/opensea.png")} width="25" height="25" alt="logo" />Opensea </a><span style={{marginLeft: '0.25rem', marginRight: '0.25rem'}}><b>|</b></span>
                        <a style={{color:'black'}} href="https://www.dextools.io/app/"><img src={require("../../assets/images/dextools.png")} width="25" height="25" alt="logo" />Dextools</a><span style={{marginLeft: '0.25rem', marginRight: '0.25rem'}}><b>|</b></span>
                        <a style={{color:'black'}} href="https://etherscan.io/"><img src={require("../../assets/images/etherscan.png")} width="25" height="25" alt="logo" />Etherscan</a><span style={{marginLeft: '0.25rem', marginRight: '0.25rem'}}><b>|</b></span> 
                        <a style={{color:'black'}} href="https://ens.domains/"><img src={require("../../assets/images/ens.png")} width="25" height="25" alt="logo" />ENS</a></p>
                    <p className="copyright-paragraph" style={{paddingRight: '3.0rem'}}>{statement} <a style={{ color: 'black' }} href="https://reactjs.org/">React</a><img className="react-logo" src={require("../../assets/images/logo.svg").default} alt="logo" /></p>
                </div>
            </footer>
        </div>
    )
}

export default Footer;