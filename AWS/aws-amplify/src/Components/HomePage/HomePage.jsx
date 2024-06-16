import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { homePageBitcoinPrice } from '../../UtilFunctions/homePageBitcoinPrice';
import { homePageGlobalMarketData } from '../../UtilFunctions/homePageGlobalMarketData';
import { homePageTrendingCoins } from '../../UtilFunctions/homePageTrendingCoins';
import { metricsNavbarEthPrice } from '../../UtilFunctions/metricsNavbarEthPrice';
import { homePageBitcoinPricePro } from '../../UtilFunctions/homePageBitcoinPricePRO';
import { homePageGlobalDefiDataPro } from '../../UtilFunctions/homePageGlobalDefiDataPRO';
import { homePageGlobalMarketDataPro } from '../../UtilFunctions/homePageGlobalMarketDataPRO';
import { homePageTrendingCoinsPro } from '../../UtilFunctions/homePageTrendingCoinsPRO';
import { metricsNavbarEthPricePro } from '../../UtilFunctions/metricsNavbarEthPricePRO';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { selectCoin } from '../../redux/reducer/coinSelectionReducer';
import { updateAddress, resetAddress } from '../../redux/reducer/walletAddressReducer';
import HomePageDescriptionSection from '../HomePageDescriptionSection/HomePageDescriptionSection';
import HomePageTrendingCoinsTable from '../HomePageTrendingCoinsTable/HomePageTrendingCoinsTable';
import HomePageTrendingCollectionsTable from '../HomePageTrendingCollectionsTable/HomePageTrendingCollectionsTable';
import ChangeHighlight from 'react-change-highlight';
import './HomePage.css';
import Alert from '../Alert/Alert';

const Home = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const isFreeVersion = false; // Check flag to see what version of the CoinGecko API is in use

    const [formAlert, updateAlert] = useState("");
    const [walletAddress, updateWalletAddress] = useState("");

    const globalMarketDataQuery = useQuery({
        queryKey: ['market data'],
        queryFn: homePageGlobalMarketDataPro
    });

    const globalDefiDataQuery = useQuery({
        queryKey: ['defi data'],
        queryFn: homePageGlobalDefiDataPro
    });

    const trendingCoinsQuery = useQuery({
        queryKey: ['transaction data'],
        queryFn: homePageTrendingCoinsPro
    });

    // Pass function to child component
    const updateFormAddress = (e) => {
        updateWalletAddress(e.target.value);
    }

    // Pass address to local storage for API call
    const formHandler = (e) => {
        e.preventDefault();

        if (walletAddress.length === 42 && walletAddress.substring(0, 2) === "0x"){
            dispatch(updateAddress(walletAddress)); // Update redux store to contain wallet address
            updateAlert("");
            navigate("/transactions");    
        }
        else {
            // If invalid address is passed, reset state
            if (formAlert === "invalid"){
                e.target.reset();
                dispatch(resetAddress());
            }
            else {
                updateAlert("invalid");
                dispatch(resetAddress());
            }
        }
    }

    // Conditionally render based on loading, error, or success states for each of the four queries
    if (trendingCoinsQuery.isLoading || globalMarketDataQuery.isLoading || globalDefiDataQuery.isLoading) {
        return <div role="main">Loading...</div>
    }
    else if (trendingCoinsQuery.isError || globalMarketDataQuery.isError || globalDefiDataQuery.isError){
        return <div role="main">Error fetching data!</div>
    }
    else if (trendingCoinsQuery.isSuccess && globalMarketDataQuery.isSuccess && globalDefiDataQuery.isSuccess){
        // Global market data information, destructuring data
        const { active_cryptocurrencies } = globalMarketDataQuery.data[0].data;
        const { usd } = globalMarketDataQuery.data[0].data.total_market_cap;
        const { btc, eth } = globalMarketDataQuery.data[0].data.market_cap_percentage;
        const { market_cap_change_percentage_24h_usd } = globalMarketDataQuery.data[0].data;

        return (
            <div class="home">
                <main role="main">
                        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                            <h1 class="h2 p-3">Dashboard</h1>
                        </div>
                        { formAlert === "invalid" ? <div><Alert type="danger"/></div> : <div/> }
                        <HomePageDescriptionSection form={ formHandler } updatingAddress={ updateFormAddress } />
                        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                            <h1 class="h2 p-3">Market Data</h1>
                        </div>
                        <div class="container">
                            <h5 style={{ marginBottom: '1rem', width: '50%', marginLeft: 'auto', marginRight: 'auto' }}><b>Global Markets</b></h5>
                            <p style={{ marginRight: '0.5rem' }}><b>Active Currencies: </b> { active_cryptocurrencies }</p>      
                            <p style={{ marginRight: '0.5rem' }}><b>Total Market Cap: </b> ${ (usd).toFixed(2) }</p>
                            <p style={{ marginRight: '0.5rem' }}><b>Market Dominance: </b> BTC { (btc).toFixed(2) + "%" } <b>|</b> ETH { (eth).toFixed(2) + "%" }</p>
                            <p style={{ marginBottom: '4rem', marginRight: '0.5rem' }}><b>24 Hour Market Cap % Change: </b>
                                <p style={{ display: 'inline', color: market_cap_change_percentage_24h_usd < 0 ? 'red' : 'green', fontWeight: 'bold'} }>
                                    { market_cap_change_percentage_24h_usd < 0 ? "" : "+" }{ (market_cap_change_percentage_24h_usd).toFixed(2) + "%" }
                                </p>
                            </p>
                            <hr />
                            <h5 style={{ marginBottom: '1rem', width: '50%', marginLeft: 'auto', marginRight: 'auto' }}><b>DeFi Markets</b></h5>
                            <p style={{ marginRight: '0.5rem' }}><b>DeFi Market Cap: </b> { "$" + Number(globalDefiDataQuery.data[0].defi_market_cap).toFixed(2) }</p>      
                            <p style={{ marginRight: '0.5rem' }}><b>ETH Market Cap: </b> { "$" + Number(globalDefiDataQuery.data[0].eth_market_cap).toFixed(2) }</p>
                            <p style={{ marginRight: '0.5rem' }}><b>Trading Volume: </b> { "$" + Number(globalDefiDataQuery.data[0].trading_volume_24h).toFixed(2) }</p>
                            <p style={{ marginRight: '0.5rem' }}><b>Top Coin Name: </b> { globalDefiDataQuery.data[0].top_coin_name }</p>
                            <p style={{ marginRight: '0.5rem' }}><b>Top Coin DeFi Dominance: </b> { Number(globalDefiDataQuery.data[0].top_coin_defi_dominance).toFixed(2) + "%" }</p>
                            <div class="row">
                                <div>
                                    <hr style={{ marginTop: '3rem' }} />
                                    <h5 style={{ marginBottom: '1rem', width: '50%', marginLeft: 'auto', marginRight: 'auto' }}><b>Trending Coins</b></h5>
                                    <HomePageTrendingCoinsTable coins={ trendingCoinsQuery.data.coins } />
                                </div>
                            </div>
                            <div class="row">
                                <div>
                                    <hr style={{ marginTop: '3rem' }} />
                                    <h5 style={{ marginTop: '3rem', width: '50%', marginLeft: 'auto', marginRight: 'auto' }}><b>Trending Collections</b></h5>
                                    <HomePageTrendingCollectionsTable collections={ trendingCoinsQuery.data.nfts } />
                                </div>
                            </div>
                        </div>
                </main>
            </div>
        )
    }
}

export default Home;