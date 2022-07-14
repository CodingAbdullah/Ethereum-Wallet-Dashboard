import React from 'react';
import '../Footer/Footer.css';

const Footer = () => {
    
    const statement = "Copyright "  + new Date().getFullYear() + ". Powered By React ";
    return (
        <div className="footer">
            <section id="footer">
                <section id="footer-section">
                    <div className="footer-icon row row">
                        <div className="footer-icon-row col-lg-12">
                            <p className="copyright-paragraph">{statement} <img className="react-logo" src={require("../../assets/logo.svg").default} alt="logo" /></p>
                        </div>
                    </div>
                </section>
            </section>
        </div>
    )
}

export default Footer;