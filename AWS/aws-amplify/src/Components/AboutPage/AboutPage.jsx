import React from 'react';
import { useNavigate } from 'react-router';

const AboutPage = () => {
    const navigate = useNavigate();
    return (
        <div className='about'>
                <main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-md-4">
                    <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                            <h1>About</h1>
                            <hr />
                    </div>
                    <div class="d-flex justify-content-between flex-wrap flex-md-nowrap pt-3 pb-2 mb-3 border-bottom">
                            <p>The Ethereum Wallet Dashboard provides users with a more visual description of everything related to crypto and their crypto-related assets. 
                                Centred around the concept of Etherscan, but more lightweight in nature. Offers the ability to quickly visualize and analyze information. 
                                Whether you are looking up wallet activity, perform analytics or get a quick check up on prices, this is the place to do it! 
                            </p>
                    </div>
                    <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                            <h4>Features</h4>
                            <hr />
                    </div>
                    <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                            <p>Daily/Weekly/Monthly coin charts, organized by market cap. In addition, ens lookups, wallet analytics, transactions (including internal, ERC20, ERC721, ERC1155, if applicable), 
                                and historical information pertaining to a wallet, including historical Ether balance.
                            </p>
                    </div>
                    <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                            <h4>Credits</h4>
                            <hr />
                    </div>
                    <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                            <p>Much of the information that is obtained through this app is provided by external, trusted, open-source APIs. 
                                These are publicly verified and secure meaning that you do not have to worry about security. The APIs used in this project were free of charge, with some limited restrictions [calls/(second/minute/hour), etc.].
                                A list of these can be found in the footer section of this app.
                            </p>
                            <hr />
                    </div>

                    <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                            <h4>Author/Developer Information</h4>
                            <hr />
                    </div>
                    <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                            <p>If you are interested in learning more about the developer behind this project, you can visit their bio here:
                                <a style={{ color: 'black' }} href="https://kingabdullah.codes" target="_blank" rel="noreferrer"> <b>About The Developer</b></a>
                            </p>
                    </div>
                    <div>
                        <button class="btn btn-success" style={{ marginTop: '1.5rem' }} onClick={() => navigate("/")}>Go Home</button>
                    </div>
                </main>
        </div>
    )
}

export default AboutPage;