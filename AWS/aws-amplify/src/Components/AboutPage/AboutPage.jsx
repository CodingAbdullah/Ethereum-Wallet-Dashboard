// About Page for the Ethereum Wallet Dashboard

const AboutPage = () => {

    return (
        <main role="main">
            <section className="jumbotron text-center">
                <div class="container">
                    <h1 style={{ marginTop: '1rem' }}>About</h1>
                    <hr />
                    <p class="lead text-muted">
                        <i>An implementation of a lightweight version of Etherscan! Feel free to explore all there is in the world of Ethereum with one click!
                        View wallet activity, recent transactions, asset holdings, ERC20/721 token data, prices, and so much more!</i>
                    </p>
                    <p style={{ marginTop: '2rem', marginLeft: 'auto', marginRight: 'auto', width: '50%' }} class="lead muted">
                        <i>If you are interested in learning about the developer, you can visit their bio <a style={{ color: 'black' }} href="https://github.com/CodingAbdullah" target="_blank" rel="noreferrer">here!</a></i>
                    </p>
                </div>
            </section>
            <div class="py-5">
                <div class="container">
                    <div class="row">
                        <div class="col-md-4">
                            <div class="card mb-4">
                                <div class="card-body">
                                    <img src={ require("../../assets/images/about_code.png") } style={{ marginTop: '1rem', borderRadius: '25%' }} width="100" height="100" alt="No Logo" />
                                    <h3 style={{ marginTop: '2rem' }}>Open Source</h3>
                                    <hr />
                                    <p class="card-text text-muted">
                                        <i>Project is continually growing and adding features as the blockchain space evolves. As such, the codebase will always be open source!</i>
                                    </p>
                                    <a style={{ marginBottom: '1rem' }} target="_blank" rel="noreferrer" href="https://github.com/CodingAbdullah/Ethereum-Wallet-Dashboard" className="btn btn-success">
                                        View Source Code!
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="card mb-4 shadow-sm">
                                <div class="card-body">
                                    <img src={ require("../../assets/images/about_chart.png") } style={{ marginTop: '1rem', borderRadius: '25%' }} width="100" height="100" alt="No Logo" />
                                    <h3 style={{ marginTop: '2rem' }}>Live Updates</h3>
                                    <hr />
                                    <p class="card-text text-muted">
                                        <i>Features are updated in real-time! Explore coin prices, ENS lookups, and information related to your wallet!</i>
                                    </p>
                                    <a style={{ marginBottom: '1rem' }} target="_blank" rel="noreferrer" href="/prices" className="btn btn-success">
                                        View Coin Prices!
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="card mb-4 shadow-sm">
                                <div class="card-body">
                                    <img src={ require("../../assets/images/about_ethereum.png") } style={{ marginTop: '1rem', borderRadius: '25%' }} width="100" height="100" alt="No Logo" />
                                    <h3 style={{ marginTop: '2rem' }}>Crypto APIs</h3>
                                    <hr />
                                    <p class="card-text">
                                        <i>APIs are the main source of truth. They are verified and secure meaning that you do not have to worry about security!</i>
                                    </p>
                                    <a style={{ marginBottom: '1rem' }} href="https://github.com/CodingAbdullah/Ethereum-Wallet-Dashboard/blob/main/README.md" rel="no referrer" target="_blank" class="btn btn-success">
                                        View the APIs!
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default AboutPage;