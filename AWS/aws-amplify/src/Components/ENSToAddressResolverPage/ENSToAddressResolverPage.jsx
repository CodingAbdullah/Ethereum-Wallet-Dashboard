import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import ENSToAddressInfoTable from '../ENSToAddressInfoTable/ENSToAddressInfoTable';
import AdditionalAddressENSInfoTable from '../AdditionalAddressENSInfoTable/AdditionalAddressENSInfoTable';
import ENSOwnershipInfoTable from '../ENSOwnershipInfoTable/ENSOwnershipInfoTable';
import ENSResolverInfoTable from '../ENSResolverInfoTable/ENSResolverInfoTable';
import Alert from '../Alert/Alert';
import axios from 'axios';

const ENSToAddressResolverPage = () => {
    const navigate = useNavigate();
    const [ENSToAddress, updateENSToAddress] = useState('');
    const [setENSToAddress, updateSetENSToAddress] = useState('');

    // State set up for retrieving information related to ENS resolvers, ENS names that resolve to the owner, ENS names that resolve to a given account
    const [ENSToAddressData, updateENSToAddressData] = useState({
        information: null
    });

    const [setAlert, updateAlert] = useState(false);
    const [emptyAlert, updateEmptyAlert] = useState(false);

    const NODE_SERVER_URL = "https://18.221.208.44.nip.io/";
    const ENS_TO_ADDRESS_ENDPOINT = 'additional-address-to-ens-information';

    const clearHandler = () => {
        updateENSToAddressData((prevState) => {
            return {
                ...prevState,
                information: null
            }
        });

        updateAlert(false);
        updateEmptyAlert(false);
    }

    const ENSToAddressHandler = (e) => {
        e.preventDefault();
        
        updateSetENSToAddress(ENSToAddress);

        // ENS APIs go here.. ENS ---> Address Resolver
        if (ENSToAddress.substring(ENSToAddress.length - 4) === '.eth'){
            const options = {   
                method: 'POST', 
                mode: 'cors',  // *cors, same-origin
                body : JSON.stringify({ensName: ENSToAddress}), // Pass in body to request
                headers: { 
                    'content-type' : 'application/json', 
                }
            }
    
            axios.post(NODE_SERVER_URL + ENS_TO_ADDRESS_ENDPOINT, options) // Using Axios library
            .then(response => {
                if (response.status === 200) {
                    if (response.data.information.results.length === 0) {
                        clearHandler();
                        updateEmptyAlert(true);
                    }
                    else {
                        updateENSToAddressData((prevState) => { // Update ENS to Address for the display of tabulated information
                            return {
                                ...prevState,
                                information: response.data
                            }
                        });
                        // Remove unnecessary alerts
                        updateAlert(false);
                        updateEmptyAlert(false); 
                    }
                }
             })
            .catch(() => {
                updateEmptyAlert(true); // Update alerts
                updateAlert(false);
                updateENSToAddressData((prevState) => { // Void previous search of address --> ens
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
            updateENSToAddressData((prevState) => { // Void previous search of address --> ens
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
                <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                    <h1 class="h2">ENS Lookups</h1>
                </div>
                { setAlert ? <Alert type='danger' /> : null }
                { emptyAlert ? <Alert type='warning' /> : null }
                <div class="jumbotron">
                    <div class="container">
                        <form onSubmit={ ENSToAddressHandler }>
                            <label>ENS<b>{" → "}</b> Address Resolver</label>
                            <input class="form-control" style={{ marginTop: '1rem', marginLeft: 'auto', marginRight: 'auto', width: '50%' }} placeholder="Enter ENS" type="text" onChange={e => updateENSToAddress(e.target.value)} />
                            <button style={{marginTop: '2rem'}} class="btn btn-success" type='submit'>Lookup Reversal</button>
                        </form>
                        <button style={{marginTop: '2rem', display: 'inline'}} class='btn btn-primary' onClick={() => navigate("/")}>Go Home</button>
                        <button style={{marginTop: '2rem', marginLeft: '2rem'}} class='btn btn-warning' onClick={clearHandler}>Clear</button>  
                    </div>
                </div>
                {  
                    ENSToAddressData.information === null ? null :
                        <>
                            <hr style={{ marginTop: '3rem' }} />
                            <div style={{marginTop: '2rem'}}>
                                    <>
                                        <p>Address Resolver for ENS: <b>{ setENSToAddress }</b></p>
                                        <ENSToAddressInfoTable data={ ENSToAddressData.information } address={ setENSToAddress } />
                                    </>
                                
                            </div>
                            <hr style={{ marginTop: '3rem' }} />
                            <div style={{marginTop: '2rem'}}>
                                    <>
                                        <ENSOwnershipInfoTable address={ setENSToAddress } />
                                    </>    
                            </div>
                            <hr style={{ marginTop: '3rem' }} />
                            <div style={{marginTop: '2rem'}}>
                                    <>
                                        <ENSResolverInfoTable address={ setENSToAddress } />
                                    </>    
                            </div>
                        </>
                }
            </main>
        </div>
    )
}


export default ENSToAddressResolverPage;