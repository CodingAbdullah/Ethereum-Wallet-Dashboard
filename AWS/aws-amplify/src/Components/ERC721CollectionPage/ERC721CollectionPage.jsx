import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import Alert from '../Alert/Alert';
import ERC721CollectionDataInfoTable from '../ERC721CollectionDataInfoTable/ERC721CollectionDataInfoTable';
import ERC721CollectionTransferInfoTable from '../ERC721CollectionTransferInfoTable/ERC721CollectionTransferInfoTable';
import ERC721CollectionSalesInfoTable from '../ERC721CollectionSalesInfoTable/ERC721CollectionSalesInfoTable';
import ERC721CollectionFloorPriceInfoTable from '../ERC721CollectionFloorPriceInfoTable/ERC721CollectionFloorPriceInfoTable';
import ERC721CollectionAttributeSummaryInfoTable from '../ERC721CollectionAttributeSummaryInfoTable/ERC721CollectionAttributeSummaryInfoTable';

const ERC721CollectionPage = () => {

    const [tokenAddress, updateTokenAddress] = useState("");
    const [setTokenAddress, updateSetTokenAddress] = useState('');
    const [setAlert, updateAlert] = useState(false);

    const NODE_SERVER_URL = "https://18.221.208.44.nip.io"; // Node Server for API end points
    const TRANSFERS_ENDPOINT = '/erc721-collection-transfers';
    const TRADES_ENDPOINT = '/erc721-collection-sales';
    const FLOOR_PRICE_ENDPOINT = '/erc721-collection-floor-price';
    const COLLECTION_ATTRIBUTES_ENDPOINT = '/erc721-collection-attributes'; 

    const navigate = useNavigate();

    const [NFTData, updateNFTData] = useState({
        information: null
    });

    const [NFTFloorPrice, updateNFTFloorPrice] = useState({
        information: null
    });

    const [NFTTransfers, updateNFTTransfers] = useState({
        information: null
    });

    const[NFTAttributes, updateNFTAttributes] = useState({
        information: null
    });

    const [NFTTrades, updateNFTTrades] = useState({
        information: null
    });

    const [NFTLowestPrice, updateNFTLowestPrice] = useState({
        information: null
    });

    const alertHandler = () => { // Clear data if there is an error, function to be invoked
        updateNFTData((prevState) => {
            return {
                ...prevState,
                information: null
            }
        });

        updateNFTTransfers((prevState) => {
            return {
                ...prevState,
                information: null
            }
        });

        updateNFTTrades((prevState) => {
            return {
                ...prevState,
                information: null
            }
        });

        updateNFTLowestPrice((prevState) => {
            return {
                ...prevState,
                information: null
            }
        });

        updateNFTFloorPrice((prevState) => {
            return {
                ...prevState,
                information: null
            }
        });

        updateNFTAttributes((prevState) => {
            return {
                ...prevState,
                information: null
            }
        });
        
    }

    const clearHandler = () => {
        // Clear data and remove alerts
        alertHandler();
        updateAlert(false);
    }
    
    const formHandler = async (e) => {
        e.preventDefault();

        updateSetTokenAddress(tokenAddress);

        if (tokenAddress.length === 42 && tokenAddress.substring(0, 2) === '0x'){
            // Set options for fetch and flight responses
            const options = {
                method: 'POST',
                mode: 'cors',
                body: JSON.stringify({ address: tokenAddress }),
                headers: {
                    'content-type' : 'application/json', 
                }
            }

            try {
                // Collection Data
                const response = await axios.post(NODE_SERVER_URL + "/erc721-collection-data", options); // NFT endpoint for retrieving information related to collection
                
                if (response.status !== 200){
                    updateAlert(true);
                    alertHandler();
                }
                else {
                    if (response.status === 200 && response.data.information.total === 0){ // If empty, clear data
                        alertHandler();
                    }
                    else {
                        updateAlert(false); // Remove alerts if any exist
                        updateNFTData((prevState) => {
                            return {
                                ...prevState,
                                information: response.data.information
                            }
                        });
                    }
                }
            }
            catch {
                alertHandler();
                updateAlert(true);
            };

            try {
                // Transfers Data
                const transfersData = await axios.post(NODE_SERVER_URL + TRANSFERS_ENDPOINT, options); // NFT endpoint for retrieving information related to collection
                if (transfersData.status !== 200){
                    updateAlert(true);
                    alertHandler();
                }
                else {
                    if (transfersData.status === 200 && transfersData.data.information.total === 0){ // If empty, clear data
                        alertHandler();
                    }
                    else {
                        updateAlert(false); // Remove alerts if any exist
                        updateNFTTransfers((prevState) => {
                            return {
                                ...prevState,
                                information: transfersData.data.information
                            }
                        });
                    }
                }
            }
            catch {
                alertHandler();
                updateAlert(true);
            };

            try {
                // Trades Data
                const tradesData = await axios.post(NODE_SERVER_URL + TRADES_ENDPOINT, options); // NFT endpoint for retrieving information related to collection
                if (tradesData.status !== 200){
                    updateAlert(true);
                    alertHandler();
                }
                else {
                    if (tradesData.status === 200 && tradesData.data.information.total === 0){ // If empty, clear data
                        alertHandler();
                    }
                    else {
                        updateAlert(false); // Remove alerts if any exist
                        updateNFTTrades((prevState) => {
                            return {
                                ...prevState,
                                information: tradesData.data.information
                            }
                        });
                    }
                }
            }
            catch {
                alertHandler();
                updateAlert(true);
            };    
            
            /*
            try {
                // Floor Price Data
                const floorData = await axios.post(NODE_SERVER_URL + FLOOR_PRICE_ENDPOINT, options);
                if (floorData.status !== 200){
                    updateAlert(true);
                    alertHandler();
                }
                else {
                    updateNFTFloorPrice((prevState) => {
                        return {
                            ...prevState,
                            information: floorData.data
                        }
                    });
                }
            }
            catch {
                alertHandler();
                updateAlert(true);
            };
            */
            
            try {
                // Attribute Data
                const attributeData = await axios.post(NODE_SERVER_URL + COLLECTION_ATTRIBUTES_ENDPOINT, options)
                    if (attributeData.status !== 200){
                        updateAlert(true);
                        alertHandler();
                    }
                    else {
                        updateNFTAttributes((prevState) => {
                            return {
                                ...prevState,
                                information: attributeData.data
                            }
                        });
                    }
            }
            catch {
                alertHandler();
                updateAlert(true);
            }
        }
        else {
            updateAlert(true); // Set Alert
            alertHandler();
        }
    }

        return (
            <div className="erc721-collection-page">
                <main role="main" class="p-3">
                    <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                        <h1 class="h2">ERC-721 Collection Analytics</h1>
                    </div>
                    { setAlert ? <Alert type='danger' /> : null }
                    <div class="jumbotron">
                        <div class="container">
                            <p>Enter Contract Address of an <b>ERC721</b> token for analytics (limited to 100)</p>
                            <form onSubmit={formHandler}>
                                <input style={{marginLeft: '0.5rem'}} onChange={e => updateTokenAddress(e.target.value)} type='text' placeholder='Enter Address Here'></input>
                                <br />
                                <button style={{marginTop: '2rem'}} type='submit' class='btn btn-success'>Submit</button>
                            </form>
                            <button style={{marginTop: '2rem', display: 'inline'}} class='btn btn-primary' onClick={() => navigate("/")}>Go Home</button>
                            <button style={{marginTop: '2rem', marginLeft: '2rem'}} class='btn btn-warning' onClick={clearHandler}>Clear</button> 
                        </div>
                    </div>
                </main>
                { 
                    NFTData.information === null ? null : 
                        <>
                            <main style={{marginTop: '3rem'}} role="main" class="col-md-9 ml-sm-auto col-lg-10 px-md-4">
                                <h4>NFT Collection Name: <b>{ NFTData.information.result[0].name }</b></h4>
                                <h4>Contract Address: <b>{ setTokenAddress }</b></h4> 
                                <h4>Total Items: <b>{ NFTData.information.total }</b></h4> 
                            </main>
                        </>  
                }
                {
                    NFTData.information === null ? null :
                        <>
                            <main style={{marginTop: '5rem'}} class="col-md-9 ml-sm-auto col-lg-10 px-md-4" role="main">
                                <div style={{marginTop: '1rem'}} class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                                    <h3 class="h3">Sample Collection Data</h3>
                                </div>
                            </main>
                            <ERC721CollectionDataInfoTable quantity={ NFTData.information.total } data={ NFTData.information.result } />
                        </>
                }
                {
                    NFTFloorPrice.information === null ? null :
                        <>
                            <main style={{marginTop: '5rem'}} class="col-md-9 ml-sm-auto col-lg-10 px-md-4" role="main">
                                <div style={{marginTop: '1rem'}} class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                                    <h3 class="h3">Collection Floor Price</h3>
                                </div>                                
                            </main>
                            <ERC721CollectionFloorPriceInfoTable data={ NFTFloorPrice.information } />
                        </>
                }
                {
                    NFTAttributes.information === null ? null :
                        <>
                            <main style={{marginTop: '5rem'}} class="col-md-9 ml-sm-auto col-lg-10 px-md-4" role="main">
                                <>
                                    <div style={{marginTop: '1rem'}} class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                                        <h3 class="h3">Collection Attributes</h3>
                                    </div>
                                </> 
                            </main>
                            <ERC721CollectionAttributeSummaryInfoTable data={ NFTAttributes.information } />
                        </>
                }
                {
                    NFTTransfers.information === null ? null :
                        <>
                            <main style={{marginTop: '5rem'}} class="col-md-9 ml-sm-auto col-lg-10 px-md-4" role="main">
                                <div style={{marginTop: '1rem'}} class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                                    <h3 class="h3">Sample Collection Transfer Data</h3>
                                </div>
                            </main>
                            <ERC721CollectionTransferInfoTable data={ NFTTransfers.information.result } />
                        </>
                }
                {
                    NFTTrades.information === null ? null :
                        <>
                            <main style={{marginTop: '5rem'}} class="col-md-9 ml-sm-auto col-lg-10 px-md-4" role="main">
                                <div style={{marginTop: '1rem'}} class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                                    <h3 class="h3">Recent Collection Sales</h3>
                                </div>
                            </main>
                            <ERC721CollectionSalesInfoTable data={ NFTTrades.information.result } />
                        </>
                }
            </div>
        )
}

export default ERC721CollectionPage;