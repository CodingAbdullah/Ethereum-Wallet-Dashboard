import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import AddressToENSInfoTable from '../AddressToENSInfoTable/AddressToENSInfoTable';
import AdditionalAddressToENSInfoTable from '../AdditionalAddressToENSInfoTable/AdditionalAddressToENSInfoTable';
import ENSOwnershipInfoTable from '../ENSOwnershipInfoTable/ENSOwnershipInfoTable';
import Alert from '../Alert/Alert';
import axios from 'axios';

const AddressToENSResolverPage = () => {
    const navigate = useNavigate();
    const [addressToENS, updateAddressToENS] = useState('');

    // State set up for retrieving information related to ENS resolvers, ENS names that resolve to the owner, ENS names that resolve to a given account
    const [addressToEnsData, updateAddressToEnsData] = useState({
        information: null
    });

    const [ensResolverData, updateEnsResolverData] = useState({
        information: null
    });

    const [setAlert, updateAlert] = useState(false);
    const [emptyAlert, updateEmptyAlert] = useState(false);

    const ADDRESS_TO_ENS_MORALIS_ENDPOINT = "https://deep-index.moralis.io/api/v2/resolve/";

    const clearHandler = () => {
        updateAddressToEnsData((prevState) => {
            return {
                ...prevState,
                information: null
            }
        });

        updateAlert(false);
        updateEmptyAlert(false);
    }

    const AddressToENSHandler = (e) => {
        e.preventDefault();
        
        // ENS APIs go here.. Address ---> ENS Resolver second
        if (addressToENS.length === 42 && addressToENS.substring(0, 2) === '0x'){
            const options = {   
                method: 'GET', 
                mode: 'no-cors', // no-cors, *cors, same-origin
                headers: { 
                    'content-type' : 'application/json', 
                    'access-control-allow-origin': '*',
                    'X-API-KEY' : process.env.REACT_APP_MORALIS_API_KEY // Transpose API key hidden 
                }
            }
    
            axios.get(ADDRESS_TO_ENS_MORALIS_ENDPOINT + addressToENS + "/reverse", options) // Using Axios library
            .then(response => {
                updateAddressToEnsData((prevState) => { // Update Address to Ens for the display of tabulated information
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
                updateAddressToEnsData((prevState) => { // Void previous search of address --> ens
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
            updateAddressToEnsData((prevState) => { // Void previous search of address --> ens
                return {
                    ...prevState,
                    information: null
                }
            });
        }
    }
    
    return (
        <div className="ens-page">
            <main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-md-4">
                <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                    <h1 class="h2">ENS Lookups</h1>
                </div>
                { setAlert ? <Alert type='danger' /> : null }
                { emptyAlert ? <Alert type='warning' /> : null }
                <div class="jumbotron">
                    <div class="container">
                        <form onSubmit={AddressToENSHandler}>
                            <label style={{marginRight: '2rem'}}>Address<b>{" ---> "}</b> ENS Resolver</label>
                            <input type="text" onChange={e => updateAddressToENS(e.target.value)} />
                            <br />
                            <button style={{marginTop: '2rem'}} class="btn btn-success" type='submit'>Lookup Reversal</button>
                        </form>
                        <button style={{marginTop: '2rem', display: 'inline'}} class='btn btn-primary' onClick={() => navigate("/")}>Go Home</button>
                        <button style={{marginTop: '2rem', marginLeft: '2rem'}} class='btn btn-warning' onClick={clearHandler}>Clear</button>  
                    </div>
                </div>
                <div style={{marginTop: '2rem'}}>
                    { addressToEnsData.information === null ? <div /> : 
                        <>
                            <div style={{marginTop: '2rem'}} class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                                <h3 class="h3">Resolver Information</h3>
                            </div>
                            <h6>ENS Resolver for Wallet Address: <b>{addressToENS}</b></h6>
                            <AddressToENSInfoTable data={ addressToEnsData.information } />
                        </>    
                    }
                </div>
                <div style={{marginTop: '2rem'}}>
                    { addressToEnsData.information === null ? <div /> : 
                        <>
                            <div style={{marginTop: '2rem'}} class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                                <h3 class="h3">Additional Information</h3>
                            </div>
                            <AdditionalAddressToENSInfoTable data={ addressToEnsData.information } />
                        </>    
                    }
                </div>
                <div style={{marginTop: '2rem'}}>
                    { addressToEnsData.information === null ? <div /> : 
                        <>
                            <div style={{marginTop: '2rem'}} class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                                <h3 class="h3">ENS Names Resolving To Owner</h3>
                            </div>
                            <ENSOwnershipInfoTable address={ addressToENS } />
                        </>    
                    }
                </div>
            </main>
        </div>
    )
}


export default AddressToENSResolverPage;