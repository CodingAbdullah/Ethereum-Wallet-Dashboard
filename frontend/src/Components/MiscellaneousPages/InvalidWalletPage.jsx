import React from 'react';
import { useNavigate } from 'react-router-dom';

const InvalidWalletPage = () => {
    const navigate = useNavigate();

    return (
        <div className="invalid-wallet-page">
            <h1 style={{marginTop: '1.5rem'}}>Invalid Wallet, please enter a valid address!</h1>
            <button style={{marginTop: '1.5rem'}} onClick={() => navigate("/")} class='btn btn-success'>Go Home</button> 
        </div>
    )
}

export default InvalidWalletPage;