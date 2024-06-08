import React, { useState } from 'react';
import { useNavigate } from 'react-router';

const ENSPage = () => {
    const [ENSURL, updateENSURL] = useState("address-to-ens-lookup");
    const navigate = useNavigate();

    // State handler function to manage lookup option request
    const selectHandler = e => {
        updateENSURL(e.target.value);
    }

    // Allow for navigation to different ENS lookups
    return (
        <div>
            <main role="main" className="p-3">
                <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                    <h1 className="h2">ENS Lookups</h1>
                </div>
                <div className="jumbotron" style={{ marginLeft: 'auto', marginRight: 'auto', width: '50%' }}>
                    <div className="container">
                        <p><i>Select ENS lookup options from the menu below!</i></p>
                        <select value={ ENSURL } onChange={ selectHandler } className="form-select" aria-label="Default select example">
                            <option selected value="address-to-ens-lookup">Address → ENS</option>
                            <option value="ens-to-address-lookup">ENS → Address</option>
                            <option value="ens-transfers-by-name">ENS Transfers By Name</option>
                            <option value="ens-transfers-by-id">ENS Transfers By ID</option>
                        </select>
                    </div>
                    <button style={{ marginTop: '1rem'}} onClick={ () => navigate("/ens-lookup" + '/' + ENSURL) } className='btn btn-success'>View</button>
                </div>
            </main> 
        </div> 
    )
}

export default ENSPage;