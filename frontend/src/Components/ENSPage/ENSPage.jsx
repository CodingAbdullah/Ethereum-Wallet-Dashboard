import React, { useState } from 'react';


const ENSPage = () => {

    const [ensToAddress, updateENSToAddress] = useState('');
    const [addressToENS, updateAddressToENS] = useState('');

    const formHandler = (e) => {
        // ENS APIs go here..

    }

    return (
        <div className="ens-page">
            <main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-md-4">
                <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                    <h1 class="h2">ENS - Ethereum Naming Service</h1>
                </div>
                <form onSubmit={formHandler}>
                    <h4>ENS Lookups</h4>
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