import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import Alert from '../Alert/Alert';
import ERC721LookupsInfoTable from './ERC721LookupsInfoTable';
import axios from 'axios';

const ERC721Lookups = () => {

    const [tokenAddress, updateTokenAddress] = useState(""); // Initialize ERC721 contract attributes
    const [tokenId, updateTokenId] = useState("");    
    const [setAlert, updateAlert] = useState(false);

    const [tokenData, updateTokenData] = useState({
        information: null
    });
    
    const navigate = useNavigate();

    const URL = 'https://deep-index.moralis.io/api/v2/'; // API endpoints for NFT lookup
    const LOOKUP_ENDPOINT = 'nft/';

    const tokenHandler = (e) => {
        e.preventDefault(); // Prevent Default Behaviour

        const options = {
            method: 'GET',
            mode: 'no-cors',
            headers: {
                'content-type' : 'application/json', 
                'accept': 'application/json',
                'access-control-allow-origin': '*',
                'X-API-KEY' : process.env.REACT_APP_MORALIS_API_KEY // Moralis API key hidden 
            }
        }
        if (tokenAddress.length === 42 && tokenAddress.substring(0, 2) === '0x'){
            axios.get(URL + LOOKUP_ENDPOINT + tokenAddress + "/" + tokenId + "?chain=eth&format=decimal", options)
            .then(response => {
                if (response.status !== 200){
                    updateAlert(true);
                    updateTokenData((prevState) => { // Reinstate errors if correct information is not entered
                        return {
                            ...prevState,
                            information: null
                        }
                    });
                }
                else {
                    updateAlert(false); // Remove alerts if any exist
                    updateTokenData((prevState) => {
                        return {
                             ...prevState,
                            information: response.data
                        }
                    });
                    console.log(response);
                }
            })
            .catch(err => console.log(err));
        }
        else {
            updateAlert(true);
            updateTokenData((prevState) => { // Reinstate errors if correct information is not entered
                return {
                    ...prevState,
                    information: null
                }
            });
        }
    }

    return (
        <div>
             <main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-md-4">
                { setAlert ? <Alert type="danger" /> : null }
                <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                    <h2>ERC721 Token Lookup</h2>
                </div>
                <form onSubmit={tokenHandler}>
                    <h3 style={{marginRight: '0.5rem'}}>Enter ERC721 Contract Address & Token ID for Lookup </h3>
                    <label>Enter ERC721 Contract Address: </label>
                    <input type="text" onChange={e => updateTokenAddress(e.target.value)} placeholder="Enter here" required />
                    <br />
                    <label>Enter Token ID: </label>
                    <input type="text" onChange={e => updateTokenId(e.target.value)} placeholder="Enter here" required />
                    <br />
                    <button style={{marginTop: '3rem'}} type="submit" class="btn btn-primary">Lookup</button>
                </form>
                <button style={{marginTop: '2rem', display: 'inline'}} class='btn btn-success' onClick={() => navigate("/")}>Go Home</button>
                <button style={{marginTop: '2rem', marginLeft: '2rem'}} class='btn btn-warning' onClick={() => { updateAlert(false); updateTokenData((prevState) => { return { ...prevState, information: null }} )}}>Clear</button>
                { tokenData.information !== null ? <h5 style={{marginTop: '2rem'}}>Lookup</h5> : null }
                <div style={{marginTop: '2rem'}}>
                    { tokenData.information === null ? <div /> : <ERC721LookupsInfoTable data={tokenData.information} /> }
                </div>
            </main>
        </div>
    )

}

export default ERC721Lookups;