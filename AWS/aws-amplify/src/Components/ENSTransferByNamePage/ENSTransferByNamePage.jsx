import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import ENSTransferByNameInfoTable from '../ENSTransferByNameInfoTable/ENSTransferByNameInfoTable';
import Alert from '../Alert/Alert';
import axios from 'axios';

const ENSTransferByNamePage = () => {
    const navigate = useNavigate();
    const [ensAddress, updateENSAddress] = useState('');

    // State set up for retrieving information related to ENS resolvers, ENS names that resolve to the owner, ENS names that resolve to a given account
    const [ENSTransferData, updateENSTransferData] = useState({
        information: null
    });

    const [setAlert, updateAlert] = useState(false);
    const [emptyAlert, updateEmptyAlert] = useState(false);

    const NODE_SERVER_URL = "https://18.221.208.44.nip.io/"; // AWS EC2 Node Server URL
    const ENS_TO_ADDRESS_ENDPOINT = 'ens-transfers-by-name';

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
        if (ensAddress.substring(ensAddress.length - 4) === '.eth'){
            const options = {   
                method: 'POST', 
                mode: 'cors', // *cors, same-origin
                body : JSON.stringify({ensName: ensAddress}), // Pass in body to request
                headers: { 
                    'content-type' : 'application/json', 
                }
            }
    
            axios.post(NODE_SERVER_URL + ENS_TO_ADDRESS_ENDPOINT, options) // Using Axios library
            .then(response => {
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
        else {
            updateAlert(true); // Invalid address, display alert
            updateEmptyAlert(false);
            updateENSTransferData((prevState) => { // Void previous search of address --> ens
                return {
                    ...prevState,
                    information: null
                }
            });
        }
    }
    return (
        <div className="ens-page">
            <main role="main" class="p-3">
                <div>                    
                    <h1>ENS Lookups</h1>
                    <hr />
                </div>
                { setAlert ? <Alert type='danger' /> : null }
                { emptyAlert ? <Alert type='warning' /> : null }
                <div class="jumbotron">
                    <div class="container">
                        <form onSubmit={ ENSTransferHandler }>
                            <p className="lead text-muted"><i>ENS transfers by name</i></p>
                            <input class="form-control" style={{ marginTop: '1rem', marginLeft: 'auto', marginRight: 'auto', width: '50%' }} type="text" placeholder="Enter ENS name for transfer data" onChange={e => updateENSAddress(e.target.value)} />
                            <button style={{marginTop: '2rem'}} class="btn btn-success" type='submit'>Lookup Transfers</button>
                        </form>
                        <button style={{marginTop: '2rem', display: 'inline'}} class='btn btn-primary' onClick={() => navigate("/")}>Go Home</button>
                        <button style={{marginTop: '2rem', marginLeft: '2rem'}} class='btn btn-warning' onClick={clearHandler}>Clear</button>  
                    </div>
                </div>
                <hr style={{ marginTop: '3rem' }} />
                <div style={{marginTop: '2rem'}}>
                    { ENSTransferData.information === null ? null : 
                        <>
                            { ENSTransferData.information.information.results.length === 0 ? <Alert type="warning" />  : <ENSTransferByNameInfoTable data={ ENSTransferData.information } /> }
                        </>    
                    }
                </div>
            </main>
        </div>
    )
}

export default ENSTransferByNamePage;