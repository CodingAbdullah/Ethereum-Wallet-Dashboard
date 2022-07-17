import React from 'react';
import './Home.css';

const Home = () => {

    return (
        <main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-md-4">
            <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                <h1 class="h2">Dashboard</h1>
            </div>
            <div class="jumbotron">
                    <div class="container">
                        <h1 class="display-5">Welcome!</h1>
                        <p>Your one-stop shop to check the bearings of your wallet and price action. Enter below the <b>public</b> address (the 42-digit hex code) of your wallet to track your activity!</p>
                        <form>
                            <input class="form-control mr-sm-2" type="search" placeholder="Enter Wallet Address (0xa2e3wet5f...)" max="42" min="42" aria-label="Search" required />
                            <button class="btn btn-outline-success wallet-search-button" type="submit">Search &raquo;</button>
                        </form>
                    </div>
            </div>
        </main>
    )
}

export default Home;