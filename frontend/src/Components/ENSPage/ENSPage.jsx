import React, { useState } from 'react';
import AddressToENSInfoTable from './AddressToENSInfoTable';
import Alert from '../Alert/Alert';
import axios from 'axios';

const ENSPage = () => {

    const [addressToENS, updateAddressToENS] = useState('');

    const [addressToEnsData, updateAddressToEnsData] = useState({
        information: null
    });

    const [setAlert, updateAlert] = useState(false);

    const ADDRESS_TO_ENS_MORALIS_ENDPOINT = "https://deep-index.moralis.io/api/v2/resolve/";

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
                console.log(response);
                updateAddressToEnsData((prevState) => { // Update Address to Ens for the display of tabulated information
                    return {
                        ...prevState,
                        information: response.data
                    }
                });
                updateAlert(false);
             })
            .catch(err => {
                console.log(err);
                updateAlert(true); 
                updateAddressToEnsData((prevState) => { // Void previous search of address --> ens
                    return {
                        ...prevState,
                        information: null
                    }
                });  
            });        
        }
        else {
            updateAlert(true); // Invalid address
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
                    <h1 class="h2">ENS - Ethereum Naming Service</h1>
                </div>
                <h4>ENS Lookups</h4>
                { setAlert ? <Alert type='danger' /> : null}
                <form style={{marginTop: '3rem'}} onSubmit={AddressToENSHandler}>
                    <label style={{marginRight: '2rem'}}>{"Address -> ENS Resolver"}</label>
                    <input type="text" onChange={e => updateAddressToENS(e.target.value)} />
                    <br />
                    <button style={{marginTop: '1rem'}} class="btn btn-success" type='submit'>Submit</button>
                </form>
                <div style={{marginTop: '2rem'}}>
                    { addressToEnsData.information === null ? <div /> : 
                        <div>
                            <h6>ENS Resolver for Wallet Address: <b>{addressToENS}</b></h6>
                            <AddressToENSInfoTable data={addressToEnsData.information } />
                        </div> 
                    }
                </div>
            </main>
        </div>
    )
}


export default ENSPage;