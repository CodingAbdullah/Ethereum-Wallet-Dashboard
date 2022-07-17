import React from 'react';
import './Navbar.css';

const Navbar = () => {
    
    return (
        <div>
            <nav class="navbar navbar-dark bg-dark">
                <h3 style={{color: 'white'}}>Ethereum Wallet</h3>
                <form class="form-inline">
                    <input class="form-control mr-sm-2" type="search" min="42" max="42" placeholder="Enter Wallet Address" aria-label="Search" required />
                    <button class="btn btn-outline-success" type="submit">Search</button>
                </form>
            </nav>
        </div>
    );
}

export default Navbar;