import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import ENSTransferByIdInfoTable from '../ENSTransferByIdInfoTable/ENSTransferByIdInfoTable';
import Alert from '../Alert/Alert';
import axios from 'axios';

const ENSTransferByIdPage = () => {
    const navigate = useNavigate();
    const [tokenID, updateTokenID] = useState('');

    // State set up for retrieving information related to ENS resolvers, ENS names that resolve to the owner, ENS names that resolve to a given account
    const [ENSTransferData, updateENSTransferData] = useState({
        information: null
    });

    const [setAlert, updateAlert] = useState(false);
    const [emptyAlert, updateEmptyAlert] = useState(false);

    const NODE_SERVER_URL = "https://18.221.208.44.nip.io/"; // AWS EC2 Node Server URL
    const ENS_TO_ADDRESS_ENDPOINT = 'ens-transfers-by-id';

    const clearHandler = () => {
        updateENSTransferData((prevState) => {
            return {
                ...prevState,
                information: null
            }
        });

        updateAlert(false);
        updateEmptyAlert(false);
    }

    const ENSTransferHandler = (e) => {
        e.preventDefault();
        
        // ENS APIs go here.. ENS ---> Address Resolver
            const options = {   
                method: 'POST', 
                mode: 'cors', // *cors, same-origin
                body : JSON.stringify({ id: tokenID }), // Pass in body to request
                headers: { 
                    'content-type' : 'application/json', 
                }
            }
    
            axios.post(NODE_SERVER_URL + ENS_TO_ADDRESS_ENDPOINT, options) // Using Axios library
            .then(response => {
                console.log(response);
                updateENSTransferData((prevState) => { // Update ENS to Address for the display of tabulated information
                    return {
                        ...prevState,
                        information: response.data
                    }
                });
                // Remove unnecessary alerts
                updateAlert(false);
                updateEmptyAlert(false); 
             })
            .catch(() => {
                updateEmptyAlert(true); // Update alerts
                updateAlert(false);
                updateENSTransferData((prevState) => { // Void previous search of address --> ens
                    return {
                        ...prevState,
                        information: null
                    }
                });  
            });   
        }

    return (
        <div className="ens-page">
            <main role="main" class="p-3">
                <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                    <h1 class="h2">ENS Lookups</h1>
                </div>
                { setAlert ? <Alert type='danger' /> : null }
                { emptyAlert ? <Alert type='warning' /> : null }
                <div class="jumbotron">
                    <div class="container">
                        <form onSubmit={ENSTransferHandler}>
                            <label style={{marginRight: '2rem'}}>Token Id for ENS Transfers</label>
                            <input type="number" placeholder="Enter Token ID" onChange={e => updateTokenID(e.target.value)} />
                            <br />
                            <button style={{marginTop: '2rem'}} class="btn btn-success" type='submit'>Lookup Transfers</button>
                        </form>
                        <button style={{marginTop: '2rem', display: 'inline'}} class='btn btn-primary' onClick={() => navigate("/")}>Go Home</button>
                        <button style={{marginTop: '2rem', marginLeft: '2rem'}} class='btn btn-warning' onClick={clearHandler}>Clear</button>  
                    </div>
                </div>
                <div style={{ marginTop: '2rem' }}>
                    { ENSTransferData.information === null ? null : 
                        <>
                            <div style={{marginTop: '2rem'}} class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                                <h3 class="h3">ENS Transfers</h3>
                            </div>
                            { ENSTransferData.information.information.results.length === 0 ? <Alert type="warning" />  : <ENSTransferByIdInfoTable data={ ENSTransferData.information } /> }
                        </>    
                    }
                </div>
            </main>
        </div>
    )
}

export default ENSTransferByIdPage;