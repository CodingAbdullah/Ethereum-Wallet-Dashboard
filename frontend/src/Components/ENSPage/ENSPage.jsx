import React, { useState } from 'react';
import Alert from '../Alert/Alert';

const ENSPage = () => {

    const [ensToAddress, updateENSToAddress] = useState('');
    const [addressToENS, updateAddressToENS] = useState('');

    const [setAlert, updateAlert] = useState(false);

    const URL = "https://api.transpose.io/v0/ens"; 
    const ENDPOINT = '/ens-records-by-owner'

    const formHandler = (e) => {
        e.preventDefault();

        // ENS APIs go here.. Address ---> ENS Resolver first
        if (updateAddressToENS.length === 42 && updateAddressToENS.substring(0, 2) === '0x'){
            
            fetch(URL + ENDPOINT, 
                {   method: 'GET', 
                    body: JSON.stringify({ owner_address: addressToENS }), 
                    headers: { 
                        'content-type' : 'application/json', 
                        'X-API-KEY' : process.env.REACT_APP_TRANSPOSE_API_KEY // Transpose API key hidden 
                    }
                }
            )
            .then(response => response.json())
            .then(res => { 
                if (res.status === 'error'){
                    updateAlert(true); // If response is 401, 404, or 500 set alert
                }
                else {
                    if (setAlert) {
                        updateAlert(false); // If Alert was set, remove it
                    }    
                    console.log(res);
                }
            })
            .catch(err => console.error(err)); // Retrieve error
        }
    }

    return (
        <div className="ens-page">
            <main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-md-4">
                <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                    <h1 class="h2">ENS - Ethereum Naming Service</h1>
                </div>
                <form onSubmit={formHandler}>
                    <h4>ENS Lookups</h4>
                    { setAlert ? <Alert type='danger' /> : null}
                    <label style= {{marginRight: '2rem'}}>{"ENS -> Address Resolver"}</label>
                    <input type="text" onChange={e => updateENSToAddress(e.target.value)} />
                    <br />
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