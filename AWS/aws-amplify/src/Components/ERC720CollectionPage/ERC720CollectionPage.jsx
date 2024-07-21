import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ERC20TopCoins } from '../../UtilFunctions/erc20TopCoinsPRO';
import axios from 'axios';
import Alert from '../Alert/Alert';
import DurationSelector from '../DurationSelector/DurationSelector';
import ERC720PricesChart from '../ERC720PricesChart/ERC720PricesChart';
import ERC720PricesInfoTable from '../ERC720PricesInfoTable/ERC720PricesInfoTable';
import ERC720CollectionTopCoinsInfoTable from '../ERC720CollectionTopCoinsInfoTable/ERC720CollectionTopCoinsInfoTable';
import ERC720CollectionTransfersInfoTable from '../ERC720CollectionTransfersInfoTable/ERC720CollectionTransfersInfoTable';
import ERC720CollectionOwnersInfoTable from '../ERC720CollectionOwnersInfoTable/ERC720CollectionOwnersInfoTable';

const ERC720CollectionPage = () => {
    const [tokenAddress, updateTokenAddress] = useState("");
    const [interval, updateInterval] = useState('24');
    const [formAlert, updateAlert] = useState("");

    // State for tracking ERC20 token information, prices, and current ERC20 price
    const [erc20Information, updateErc20Information] = useState({
      coinData: null
    });

    const [erc20Prices, updateErc20Prices] = useState({ 
      coinPrice: null
    });

    const [currentERC20Price, updateCurrentERC20Price] = useState({
      currentValue: null
    });

    const [erc20Transfers, updateERC20Transfers] = useState({
        information: null 
    });

    const [erc20Owners, updateERC20Owners] = useState({
        information: null
    });

    const topERC20TokensQuery = useQuery({
        queryKey: ['top-erc20-tokens'],
        queryFn: ERC20TopCoins
    });

    const navigate = useNavigate();

    const intervalHandler = e => {
        updateInterval(e.target.value);
    }

    // Price, Chart, Information Table, Top ERC20 Tokens, Transfers, Owners
    // Import ERC20Chart component and Info Table, and ERC20PricesPage Component

    // Fetch data based on interval change
    useEffect(() => {
        const URL = 'http://localhost:5000';
        const ERC20_PRICE_ENDPOINT = '/ERC20-coin-price-duration';

        // Checking if token value is defined before proceeding with API call
        if (tokenAddress !== '' && tokenAddress.length === 42 && tokenAddress.substring(0, 2) === "0x"){
            let options = {
                method: "POST",
                body: JSON.stringify({ contract: tokenAddress, interval }),
                headers: {
                    'content-type' : 'application/json'
                }
            }
            
            // Request ERC20 token price information
            axios.post(URL + ERC20_PRICE_ENDPOINT, options)
            .then(response => {
                updateErc20Prices(prevState => {
                return {
                    ...prevState,
                    coinPrice: response.data.coinPrices
                }
                });
            })
            .catch(() => {
                clearHandler();
                updateAlert("invalid");
            });
        }
        else return;
    }, 
    [interval, updateInterval]);

    // Clear all data when requested
    // Set toggle back to default
    const clearHandler = () => {
        updateAlert("");
        updateErc20Information(prevState => {
            return {
                ...prevState,
                coinData: null
            }
        });

        // Clearing all data
        updateErc20Prices(prevState => {
            return {
                ...prevState,
                coinPrice: null
            }
        });

        updateCurrentERC20Price(prevState => {
            return {
                ...prevState,
                currentValue: null
            }
        });

        // Add data related to ERC20 token owners and transfers
        updateERC20Owners(prevState => {
            return {
                ...prevState,
                information: null
            }
        });

        updateERC20Transfers(prevState => {
            return {
                ...prevState,
                information: null
            }
        });
    }

    const formHandler = async (e) => {
        e.preventDefault();

        // Update and set token address to what was entered and update chart toggle
        if (tokenAddress !== '' && tokenAddress.length === 42 && tokenAddress.substring(0, 2) === "0x"){
            clearHandler();

            const URL = 'http://localhost:5000';
            const ERC20_INFO_ENDPOINT = '/ERC20-coin-information';
            const ERC20_PRICE_ENDPOINT = '/ERC20-coin-price-duration';
            const CURRENT_ERC20_PRICE_ENDPOINT = '/current-ERC20-price';
            const ERC20_OWNER_ENDPOINT = '/erc20-owners';
            const ERC20_TRANSFER_ENDPOINT = '/erc20-transfer';

            let options = {
                method: "POST",
                body: JSON.stringify({ contract: tokenAddress, interval }),
                headers: {
                    'content-type' : 'application/json'
                }
            }
        
            // Request ERC20 token price information
            axios.post(URL + ERC20_PRICE_ENDPOINT, options)
            .then(response => {
                updateErc20Prices(prevState => {
                    return {
                        ...prevState,
                        coinPrice: response.data.coinPrices
                    }
                });
            })
            .catch(() => {
                clearHandler();
                updateAlert("invalid");
            });

            // Request ERC20 token information
            axios.post(URL + ERC20_INFO_ENDPOINT, options)
            .then(response => {
                updateErc20Information(prevState => {
                    return {
                        ...prevState,
                        coinData: response.data.ERC20CoinData
                    }
                });
            })
            .catch(() => {
                clearHandler();
                updateAlert("invalid");
            });

            // Request ERC20 current price
            axios.post(URL + CURRENT_ERC20_PRICE_ENDPOINT, options)
            .then(response => {
                updateCurrentERC20Price(prevState => {
                    return {
                        ...prevState,
                        currentValue: response.data.price
                    }
                });
            })
            .catch(() => {
                clearHandler();
                updateAlert("invalid");
            });

            // Request ERC20 token owners
            axios.post(URL + ERC20_OWNER_ENDPOINT, options)
            .then(response => {
                updateERC20Owners(prevState => {
                    return {
                        ...prevState,
                        information: response.data.information
                    }
                });
            })
            .catch(() => {
                clearHandler();
                updateAlert("invalid");
            });

            // Request ERC20 token transfers
            axios.post(URL + ERC20_TRANSFER_ENDPOINT, options)
            .then(response => {
                updateERC20Transfers(prevState => {
                    return {
                        ...prevState,
                        information: response.data.information
                    }
                });
            })
            .catch(() => {
                clearHandler();
                updateAlert("invalid");
            });
        }
        else {
            if (formAlert === "invalid"){ // If the format is not of length 42 and start with 0x (hex), throw error
                e.target.reset();
            }
            else {
                clearHandler();
                updateAlert("invalid"); // If repeated multiple times, clear input and keep error as is
            }
        }
    }

    // Conditionally rendering ERC20 token information
    if (topERC20TokensQuery.isLoading) {
        return <div>Loading...</div>
    }
    else if (topERC20TokensQuery.isError) {
        return <div>Error loading ERC20 token data</div>
    }
    else {
        return (
            <div className="erc720-collection-page">
                <main role="main" class="p-3">
                    <div>                    
                        <h1>ERC20 Collection Analytics</h1>
                        <hr />
                    </div>
                    <ERC720CollectionTopCoinsInfoTable data={topERC20TokensQuery.data} />
                    { formAlert ? <Alert type='danger' /> : null }
                    <hr style={{ marginTop: '3rem' }} />
                    <div class="jumbotron">
                        <div class="container">
                            <p className="lead text-muted"><i>Enter contract address of an <b>ERC20</b> token for a quick analysis</i></p>
                            <form onSubmit={formHandler}>
                                <input class="form-control" style={{ marginTop: '1rem', marginLeft: 'auto', marginRight: 'auto', width: '50%' }} onChange={e => updateTokenAddress(e.target.value)} type='text' placeholder='Enter token address'></input>
                                <button style={{marginTop: '2rem'}} type='submit' class='btn btn-success'>Submit</button>
                            </form> 
                            <button style={{marginTop: '2rem', display: 'inline'}} class='btn btn-primary' onClick={() => navigate("/")}>Go Home</button>
                            <button style={{marginTop: '2rem', marginLeft: '2rem'}} class='btn btn-warning' onClick={clearHandler}>Clear</button>
                        </div>  
                    </div>
                    {
                        erc20Information.coinData !== null && currentERC20Price.currentValue !== null && formAlert === '' && erc20Prices.coinPrice !== null && erc20Transfers.information !== null && erc20Owners.information !== null ? 
                        <>
                            <hr style={{ marginTop: '3rem' }} />
                            <h2>{ erc20Information.coinData.name }</h2>
                            <i>{ erc20Information.coinData.contract_address }</i>
                            <br />
                            <img style={{ marginTop: '1rem', marginBottom: '1rem' }} src={ erc20Information.coinData.image.small } />
                            {
                                Object.keys(erc20Information.coinData.description).length !== 0 ?
                                    <p style={{ marginLeft: 'auto', marginRight: 'auto', width: '50%' }}><i>{ erc20Information.coinData.description.en }</i></p>
                                : null
                            }
                            <ERC720PricesChart tokenPrice={ currentERC20Price.currentValue } coinInformation={ erc20Information.coinData } priceData={ erc20Prices.coinPrice } />
                            <DurationSelector priceDurationHandler={ intervalHandler } />
                            <ERC720PricesInfoTable coinInformation={ erc20Information.coinData } />
                            { erc20Transfers.information.result.length !== 0 ? <ERC720CollectionTransfersInfoTable data={ erc20Transfers.information.result } /> : null }
                            { erc20Owners.information.result.length !== 0 ? <ERC720CollectionOwnersInfoTable data={ erc20Owners.information.result } /> : null }
                        </>
                        : null
                    }
                </main>
            </div>
        )
    }
}

export default ERC720CollectionPage;
