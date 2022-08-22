import React, { useState }from 'react';
import Alert from '../Alert/Alert';
import { useNavigate } from 'react-router';

const ERC721 = () => {

    const [walletAddress, updateWalletAddress] = useState("");
    const [setAlert, updateAlert] = useState(false);

    const navigate = useNavigate(); // React Router handler

    const walletHandler = (e) => {
        e.preventDefault();

        if (walletAddress.length === 42 && walletAddress.substring(0, 2) === '0x'){
            updateAlert(false); // Update Alert to withdraw
        }
        else {
            updateAlert(true); // Set Alert
        }
    }   

    return (
        <div className="erc-721-token-page">
            <main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-md-4">
                { setAlert ? <Alert type="danger" /> : null }
                <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                    <h2>ERC721 Token Data</h2>
                </div>
                <form onSubmit={walletHandler}>
                <label style={{marginRight: '0.5rem'}}>ERC20 Contract Address: </label>
                    <input type="text" onChange={(e) => updateWalletAddress(e.target.value)} placeholder="Enter here" required />
                    <br />
                    <button style={{marginTop: '1rem'}} type="submit" class="btn btn-primary">Check Data</button>
                </form>
                <button class='btn btn-success' onClick={navigate("/")}>Go Home</button>
            </main>
        </div>  
    )
}

export default ERC721;