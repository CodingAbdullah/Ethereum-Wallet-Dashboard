import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '../Alert/Alert';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();

    const [formAlert, updateAlert] = useState("");
    const [walletAddress, updateWalletAddress] = useState("");

    const formHandler = (e) => {
        e.preventDefault();

        if (walletAddress.length === 42 && walletAddress.substring(0, 2) === "0x") {
            localStorage.setItem("walletAddress", walletAddress);
            updateAlert("");
            updateWalletAddress("");
            e.target.reset();
            navigate("/transactions");
        }
        else {
            if (formAlert === "invalid"){
                updateWalletAddress("");
                e.target.reset();
                localStorage.clear();                
            }
            else {
                updateAlert("invalid");
                updateWalletAddress("");
                e.target.reset();
                localStorage.clear();
            }
        }
    }

    return (
        <div>
            <nav class="navbar navbar-dark bg-dark">
                <h3 style={{color: "white"}}>Ethereum Wallet</h3>
                { formAlert === "invalid" ? <Alert type="danger" /> : <div /> }
                {
                    ( window.location.pathname === '/transactions' || window.location.pathname === '/erc20-token-prices') ? <div /> : <form class="form-inline" onSubmit={formHandler}>
                        <input class="form-control mr-sm-2" type="search" min="42" max="42" placeholder="Enter Wallet Address" onChange={(e) => updateWalletAddress(e.target.value)} aria-label="Search" required />
                        <button class="btn btn-outline-success" type="submit">Search</button>
                    </form> 
                }
            </nav>
        </div>
    );
}

export default Navbar;