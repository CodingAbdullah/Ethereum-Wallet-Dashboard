import React, { useState } from 'react';
import Alert from '../Alert/Alert';
import axios from 'axios';

const ENSPage = () => {

    const [ensToAddress, updateENSToAddress] = useState('');
    const [addressToENS, updateAddressToENS] = useState('');

    const [setAlert, updateAlert] = useState(false);

    const URL = "https://api.transpose.io/v0/ens"; 
    const ADDRESS_TO_ENS_ENDPOINT = '/ens-records-by-owner'
    const ENS_TO_ADDRESS_ENDPOINT = '/ens-records-by-name';

    const ENSToAddressHandler = (e) => {
        e.preventDefault();

        // ENS APIs go here.. ENS ---> Address Resolver first
        if (updateAddressToENS.length === 42 && updateAddressToENS.substring(0, 2) === '0x'){
            const options = {   
                method: 'GET', 
                mode: 'no-cors', // no-cors, *cors, same-origin
                headers: { 
                    'content-type' : 'application/json', 
                    'access-control-allow-origin': '*',
                    'X-API-KEY' : process.env.REACT_APP_TRANSPOSE_API_KEY // Transpose API key hidden 
                }
            }
    
            axios.get(URL + ENS_TO_ADDRESS_ENDPOINT + "?ens_names=" + ensToAddress, JSON.stringify(options)) // Using Axios library
            .then(response => {
                console.log(response);
                updateAlert(false);
             })
            .catch(err => {
                console.log(err);
                updateAlert(true);   
            });        
        }
        else {
            updateAlert(true); // Invalid address
        }
    }

    const AddressToENSHandler = (e) => {
        e.preventDefault();
        
        // ENS APIs go here.. Address ---> ENS Resolver second
        if (updateAddressToENS.length === 42 && updateAddressToENS.substring(0, 2) === '0x'){
            const options = {   
                method: 'GET', 
                mode: 'no-cors', // no-cors, *cors, same-origin
                headers: { 
                    'content-type' : 'application/json', 
                    'access-control-allow-origin': '*',
                    'X-API-KEY' : process.env.REACT_APP_TRANSPOSE_API_KEY // Transpose API key hidden 
                }
            }
    
            axios.get(URL + ADDRESS_TO_ENS_ENDPOINT + "?owner_address=" + addressToENS, JSON.stringify(options)) //Using Axios library
            .then(response => {
                console.log(response);
                updateAlert(false);
             })
            .catch(err => {
                console.log(err);
                updateAlert(true);   
            });        
        }
        else {
            updateAlert(true); // Invalid address
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
                <form onSubmit={ENSToAddressHandler}>
                    <label style= {{marginRight: '2rem'}}>{"ENS -> Address Resolver"}</label>
                    <input type="text" onChange={e => updateENSToAddress(e.target.value)} />
                </form>
                <form onSubmit={AddressToENSHandler}>
                    <label style={{marginRight: '2rem'}}>{"Address -> ENS Resolver"}</label>
                    <input type="text" onChange={e => updateAddressToENS(e.target.value)} />
                    <br />
                    <button style={{marginTop: '2rem'}} class="btn btn-success" type='submit'>Submit</button>
                </form>
            </main>
        </div>
    )
}


export default ENSPage;