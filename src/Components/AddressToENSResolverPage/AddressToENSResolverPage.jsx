import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import AddressToENSInfoTable from '../AddressToENSInfoTable/AddressToENSInfoTable';
import ENSOwnershipInfoTable from '../ENSOwnershipInfoTable/ENSOwnershipInfoTable';
import ENSResolverInfoTable from '../ENSResolverInfoTable/ENSResolverInfoTable';
import Alert from '../Alert/Alert';
import axios from 'axios';

const AddressToENSResolverPage = () => {
    const navigate = useNavigate();
    const [addressToENS, updateAddressToENS] = useState('');
    const [setAddressToENS, updateSetAddressToEns] = useState('');

    // State set up for retrieving information related to ENS resolvers, ENS names that resolve to the owner, ENS names that resolve to a given account
    const [addressToEnsData, updateAddressToEnsData] = useState({
        information: null
    });

    const [setAlert, updateAlert] = useState(false);
    const [emptyAlert, updateEmptyAlert] = useState(false);

    const NODE_SERVER_URL = "https://18.221.208.44.nip.io/";
    const ADDRESS_TO_ENS_ENDPOINT = 'address-to-ens-information';

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

    const AddressToENSHandler = async (e) => {
        e.preventDefault();
        
        updateSetAddressToEns(addressToENS);

        // ENS APIs go here.. Address ---> ENS Resolver second
        if (addressToENS.length === 42 && addressToENS.substring(0, 2) === '0x'){
            
            const options = {   
                method: 'POST', 
                mode: 'cors',  // *cors, same-origin
                body : JSON.stringify({ address: addressToENS }), // Pass in body to request
                headers: { 
                    'content-type' : 'application/json', 
                }
            }
    
            try {
                const response = await axios.post(NODE_SERVER_URL + ADDRESS_TO_ENS_ENDPOINT, options); // Using Axios library
                updateAddressToEnsData((prevState) => { // Update Address to Ens for the display of tabulated information
                    return {
                        ...prevState,
                        information: response.data
                    }
                });

                // Remove unnecessary alerts
                updateAlert(false);
                updateEmptyAlert(false); 
            }        
            catch {
                updateEmptyAlert(true); // Update alerts
                updateAlert(false);
                updateAddressToEnsData((prevState) => { // Void previous search of address --> ens
                    return {
                        ...prevState,
                        information: null
                    }
                });  
            };   
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
            <main role="main" class="p-3">
                <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                    <h1 class="h2">ENS Lookups</h1>
                </div>
                { setAlert ? <Alert type='danger' /> : null }
                { emptyAlert ? <Alert type='warning' /> : null }
                <div class="jumbotron">
                    <div class="container">
                        <form onSubmit={AddressToENSHandler}>
                            <label style={{marginRight: '2rem'}}>Address<b>{" → "}</b> ENS Resolver</label>
                            <input type="text" onChange={e => updateAddressToENS(e.target.value)} />
                            <br />
                            <button style={{marginTop: '2rem'}} class="btn btn-success" type='submit'>Lookup Reversal</button>
                        </form>
                        <button style={{marginTop: '2rem', display: 'inline'}} class='btn btn-primary' onClick={() => navigate("/")}>Go Home</button>
                        <button style={{marginTop: '2rem', marginLeft: '2rem'}} class='btn btn-warning' onClick={clearHandler}>Clear</button>  
                    </div>
                </div>
                { 
                    addressToEnsData.information === null ? null : 
                        <>
                            <hr style={{ marginTop: '3rem' }} />
                            <div style={{ marginTop: '2rem' }}>
                                <>
                                    <AddressToENSInfoTable walletAddress={ setAddressToENS } data={ addressToEnsData.information.information } />
                                </>    
                            </div>
                            <hr style={{ marginTop: '3rem' }} />
                            <div style={{ marginTop: '2rem' }}>
                                <>
                                    <ENSOwnershipInfoTable address={ setAddressToENS } />
                                </>    
                            </div>
                            <hr style={{ marginTop: '3rem' }} />
                            <div style={{ marginTop: '2rem' }}>
                                <>
                                    <ENSResolverInfoTable address={ setAddressToENS } />
                                </>    
                            </div>
                        </>
                }
            </main>
        </div>
    )
}


export default AddressToENSResolverPage;