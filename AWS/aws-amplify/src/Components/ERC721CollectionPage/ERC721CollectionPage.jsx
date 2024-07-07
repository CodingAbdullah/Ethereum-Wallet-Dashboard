import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ERC721TopCollections } from '../../UtilFunctions/erc721TopCollectionsPRO';
import axios from 'axios';
import Alert from '../Alert/Alert';
import ERC721CollectionAttributeSummaryInfoTable from '../ERC721CollectionAttributeSummaryInfoTable/ERC721CollectionAttributeSummaryInfoTable';
import ERC721CollectionDataInfoTable from '../ERC721CollectionDataInfoTable/ERC721CollectionDataInfoTable';
import ERC721CollectionExtraDataInfoTable from '../ERC721CollectionExtraDataInfoTable/ERC721CollectionExtraDataInfoTable';
import ERC721CollectionFloorPriceInfoTable from '../ERC721CollectionFloorPriceInfoTable/ERC721CollectionFloorPriceInfoTable';
import ERC721CollectionSalesInfoTable from '../ERC721CollectionSalesInfoTable/ERC721CollectionSalesInfoTable';
import ERC721CollectionTransferInfoTable from '../ERC721CollectionTransferInfoTable/ERC721CollectionTransferInfoTable';
import ERC721CollectionTrendsInfoTable from '../ERC721CollectionTrendsInfoTable/ERC721CollectionTrendsInfoTable';
import ERC721CollectionFloorPriceChart from '../ERC721CollectionFloorPriceChart/ERC721CollectionFloorPriceChart';
import ERC721CollectionMarketCapChart from '../ERC721CollectionMarketCapChart/ERC721CollectionMarketCapChart';
import ERC721CollectionVolumeChart from '../ERC721CollectionVolumeChart/ERC721CollectionVolumeChart';
import DurationSelector from '../DurationSelector/DurationSelector';

const ERC721CollectionPage = () => {

    const [tokenAddress, updateTokenAddress] = useState("");
    const [setTokenAddress, updateSetTokenAddress] = useState('');
    const [chartinterval, updateChartInterval] = useState('14');

    const [setAlert, updateAlert] = useState(false);

    const chartIntervalHandler = e => {
        updateChartInterval(e.target.value);
    }

    const NODE_SERVER_URL = "http://localhost:5000"; // Node Server for API end points
    const CHART_INFO_ENDPOINT = '/erc721-collection-chart-data';
    const EXTRA_INFO_ENDPOINT = '/erc721-collection-extra-data';
    const TRANSFERS_ENDPOINT = '/erc721-collection-transfers';
    const TRADES_ENDPOINT = '/erc721-collection-sales';
    const FLOOR_PRICE_ENDPOINT = '/erc721-collection-floor-price';
    const COLLECTION_ATTRIBUTES_ENDPOINT = '/erc721-collection-attributes'; 
    
    const navigate = useNavigate();

    const ERC721TopCollectionsQuery = useQuery({
        queryKey: ['erc721-top-collections'],
        queryFn: ERC721TopCollections
    });

    const [ChartNFTData, updateChartNFTData] = useState({
        information: null
    });

    const [ExtraNFTData, updateExtraNFTData] = useState({
        information: null
    });

    const[NFTAttributes, updateNFTAttributes] = useState({
        information: null
    });

    const [NFTData, updateNFTData] = useState({
        information: null
    });

    const [NFTFloorPrice, updateNFTFloorPrice] = useState({
        information: null
    });

    const [NFTTrades, updateNFTTrades] = useState({
        information: null
    });

    const [NFTTransfers, updateNFTTransfers] = useState({
        information: null
    });


    useEffect(() => {
        // ERC721 Collection Chart data
        // Set options for fetch and flight responses
        // Make API call to backend to fetch chart data based on every interval change

        if (tokenAddress === '') return;
        const chartOptions = {
            method: 'POST',
            mode: 'cors',
            body: JSON.stringify({ address: tokenAddress, interval: chartinterval }),
            headers: {
                'content-type' : 'application/json', 
            }
        }

        axios.post(NODE_SERVER_URL + CHART_INFO_ENDPOINT, chartOptions)
        .then(response => {
            updateChartNFTData((prevState) => {
                return {
                    ...prevState,
                    information: response.data
                }
            });
        })
        .catch(() => {
            alertHandler();
            updateAlert(true);
        });
    }, [chartinterval, updateChartInterval]);

    const alertHandler = () => { // Clear data if there is an error, function to be invoked
        updateChartNFTData((prevState) => { 
            return {
                ...prevState,
                information: null
            }
        });

        updateExtraNFTData((prevState) => {
            return {
                ...prevState,
                information: null
            }
        });

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
                // Extra Collection Data

                const response = await axios.post(NODE_SERVER_URL + EXTRA_INFO_ENDPOINT, options); // NFT endpoint for retrieving information related to collection
                
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
                        updateExtraNFTData((prevState) => {
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
                // ERC721 Collection Chart data
                // Set options for fetch and flight responses
                const chartOptions = {
                    method: 'POST',
                    mode: 'cors',
                    body: JSON.stringify({ address: tokenAddress, interval: chartinterval }),
                    headers: {
                        'content-type' : 'application/json', 
                    }
                }

                const collectionChartData = await axios.post(NODE_SERVER_URL + CHART_INFO_ENDPOINT, chartOptions);
                
                if (collectionChartData.status !== 200){
                    updateAlert(true);
                    alertHandler();
                }
                else {
                    updateChartNFTData((prevState) => {
                        return {
                            ...prevState,
                            information: collectionChartData.data
                        }
                    });
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

    if (ERC721TopCollectionsQuery.isLoading) {
        return <div>Loading...</div>
    }
    else if (ERC721TopCollectionsQuery.isError) {
        return <div>Error Loading Top Collections Data</div>
    }
    else {
        return (
            <div className="erc721-collection-page">
                <main role="main" class="p-3">
                    <div>                    
                        <h1>ERC721 Collection Analytics</h1>
                        <hr />
                    </div>
                    { setAlert ? <Alert type='danger' /> : null }
                    <p><b>Top ERC721 Collections</b><br /><i>Lookup the top collections by market cap</i></p>
                    <ERC721CollectionTrendsInfoTable data={ ERC721TopCollectionsQuery.data } />
                    <hr style={{ marginTop: '3rem', marginBottom: '2rem' }} />
                    <div class="jumbotron">
                        <div class="container">
                            <p className="lead text-muted"><i>Enter contract address of an <b>ERC721</b> collection for a quick analysis</i></p>
                            <form onSubmit={ formHandler }>
                                <input class="form-control" style={{ marginLeft: 'auto', marginRight: 'auto', width: '50%' }} onChange={e => updateTokenAddress(e.target.value)} type='text' placeholder='Enter contract address'></input>
                                <button style={{ marginTop: '2rem' }} type='submit' class='btn btn-success'>Submit</button>
                            </form>
                            <button style={{ marginTop: '2rem', display: 'inline' }} class='btn btn-primary' onClick={() => navigate("/")}>Go Home</button>
                            <button style={{ marginTop: '2rem', marginLeft: '2rem' }} class='btn btn-warning' onClick={clearHandler}>Clear</button> 
                        </div>
                    </div>
                </main>
                { 
                    NFTData.information === null ? null : 
                        <>
                            <ERC721CollectionDataInfoTable data={ NFTData } /> 
                        </>  
                }
                { 
                    ChartNFTData.information === null || NFTData.information === null ? null : 
                        <>
                            <hr style={{ marginTop: '3rem', marginBottom: '2rem' }} />
                            <ERC721CollectionMarketCapChart interval={ chartinterval === '15' ? '14' : chartinterval } marketCapData={ ChartNFTData.information.marketCaps } name={ NFTData.information.result[0].name } /> 
                        </>  
                }
                { 
                    ChartNFTData.information === null || NFTData.information === null ? null : 
                        <>
                            <hr style={{ marginTop: '3rem', marginBottom: '2rem' }} />
                            <ERC721CollectionFloorPriceChart interval={ chartinterval === '15' ? '14' : chartinterval } floorPriceData={ ChartNFTData.information.floorPrices } name={ NFTData.information.result[0].name } /> 
                        </>  
                }
                { 
                    ChartNFTData.information === null || NFTData.information === null ? null : 
                        <>
                            <hr style={{ marginTop: '3rem', marginBottom: '2rem' }} />
                            <ERC721CollectionVolumeChart interval={ chartinterval === '15' ? '14' : chartinterval } volumeData={ ChartNFTData.information.volumes } name={ NFTData.information.result[0].name } /> 
                            <DurationSelector priceDurationHandler={ chartIntervalHandler } />
                        </>  
                }
                { 
                    ExtraNFTData.information === null ? null : 
                        <>
                            <ERC721CollectionExtraDataInfoTable data={ ExtraNFTData.information } /> 
                        </>  
                }
                {
                    NFTFloorPrice.information === null ? null :
                        <>
                            <ERC721CollectionFloorPriceInfoTable data={ NFTFloorPrice.information } />
                        </>
                }
                {
                    NFTAttributes.information === null ? null :
                        <>
                            <hr style={{ marginTop: '3rem', marginBottom: '2rem' }} />
                            <p><b>ERC721 Collection Attributes</b><br /><i>List of attributes and their sub-attributes and collection quantity</i></p>
                            <ERC721CollectionAttributeSummaryInfoTable data={ NFTAttributes.information } />
                        </>
                }
                {
                    NFTTransfers.information === null ? null :
                        <>
                            <hr style={{ marginTop: '3rem', marginBottom: '2rem' }} />
                            <p><b>ERC721 Collection Transfers</b><br /><i>Recent token transfer activity within collection</i></p>
                            <ERC721CollectionTransferInfoTable data={ NFTTransfers.information.result } />
                        </>
                }
                {
                    NFTTrades.information === null ? null :
                        <>
                            <hr style={{ marginTop: '3rem', marginBottom: '2rem' }} />
                            <p><b>ERC721 Collection Sales</b><br /><i>Recent token sales activity within collection</i></p>
                            <ERC721CollectionSalesInfoTable data={ NFTTrades.information.result } />
                        </>
                }
            </div>
        )
    }

}

export default ERC721CollectionPage;