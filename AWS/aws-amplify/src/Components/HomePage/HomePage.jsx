import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { homePageBitcoinPrice } from '../../UtilFunctions/homePageBitcoinPrice';
import { homePageGlobalMarketData } from '../../UtilFunctions/homePageGlobalMarketData';
import { homePageTrendingCoins } from '../../UtilFunctions/homePageTrendingCoins';
import { metricsNavbarEthPrice } from '../../UtilFunctions/metricsNavbarEthPrice';
import { homePageBitcoinPricePro } from '../../UtilFunctions/homePageBitcoinPricePRO';
import { homePageGlobalMarketDataPro } from '../../UtilFunctions/homePageGlobalMarketDataPRO';
import { homePageTrendingCoinsPro } from '../../UtilFunctions/homePageTrendingCoinsPRO';
import { metricsNavbarEthPricePro } from '../../UtilFunctions/metricsNavbarEthPricePRO';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { selectCoin } from '../../redux/reducer/coinSelectionReducer';
import { updateAddress, resetAddress } from '../../redux/reducer/walletAddressReducer';
import HomePageDescriptionSection from '../HomePageDescriptionSection/HomePageDescriptionSection';
import ChangeHighlight from 'react-change-highlight';
import './HomePage.css';
import Alert from '../Alert/Alert';

const Home = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const isFreeVersion = false; // Check flag to see what version of the CoinGecko API is in use

    const [formAlert, updateAlert] = useState("");
    const [walletAddress, updateWalletAddress] = useState("");

    // Set up queries and fetch data related to bitcoin, ethereum, the global market as well as trending coins
    const bitcoinPriceQuery = useQuery({
        queryKey: ['bitcoin price'],
        queryFn: homePageBitcoinPricePro
    });

    const ethereumPriceQuery = useQuery({
        queryKey: ['eth price'],
        queryFn: metricsNavbarEthPricePro
    });

    const globalMarketDataQuery = useQuery({
        queryKey: ['market data'],
        queryFn: homePageGlobalMarketDataPro
    });

    const trendingCoinsQuery = useQuery({
        queryKey: ['transaction data'],
        queryFn: homePageTrendingCoinsPro
    });

    // Track Bitcoin, Ethereum price changes
    const btcPriceRef = useRef();
    const ethPriceRef = useRef();

    // Pass function to child component
    const updateFormAddress = (e) => {
        updateWalletAddress(e.target.value);
    }
    
    // Bitcoin button function for setting bitcoin coin state and price lookup
    const bitcoinButtonHandler = (e) => {
        e.preventDefault();
        dispatch(selectCoin("bitcoin"));
        navigate("/chart");
    }

    // Ethereum button function for setting ethereum coin state and price lookup
    const ethereumButtonHandler = (e) => {
        e.preventDefault();
        dispatch(selectCoin("ethereum"));
        navigate("/chart");
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
    if (bitcoinPriceQuery.isLoading || ethereumPriceQuery.isLoading || trendingCoinsQuery.isLoading || globalMarketDataQuery.isLoading) {
        return <div role="main">Loading...</div>
    }
    else if (bitcoinPriceQuery.isError || ethereumPriceQuery.isError || trendingCoinsQuery.isError || globalMarketDataQuery.isError){
        return <div role="main">Error fetching data!</div>
    }
    else if (bitcoinPriceQuery.isSuccess && ethereumPriceQuery.isSuccess && trendingCoinsQuery.isSuccess && globalMarketDataQuery.isSuccess){
        // Global market data information, destructuring data
        const { active_cryptocurrencies } = globalMarketDataQuery.data[0].data;
        const { usd } = globalMarketDataQuery.data[0].data.total_market_cap;
        const { btc, eth } = globalMarketDataQuery.data[0].data.market_cap_percentage;
        const { market_cap_change_percentage_24h_usd } = globalMarketDataQuery.data[0].data;

        // Get values of coin prices and use them to compare to newly updated price for highlighting
        let previousBTCPrice = Number(btcPriceRef.current?.innerHTML.split(" ")[0].substring(1));
        let previousETHPrice = Number(ethPriceRef.current?.innerHTML.split(" ")[0].substring(1));

        // Update ticker CSS style based on price change
        let btcPriceCSSColourPicker = ( btcPriceRef.current === undefined ? "" : ( bitcoinPriceQuery.data[0].bitcoin.usd >= previousBTCPrice ? "tickerUpHighlight" : "tickerDownHighlight" ));
        let ethPriceCSSColourPicker = ( ethPriceRef.current === undefined ? "" : ( ethereumPriceQuery.data[0].ethereum.usd >= previousETHPrice ? "tickerUpHighlight" : "tickerDownHighlight" ));

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
                            <p style={{ marginBottom: '2rem' }} class='marquee-paragraph'><b>Trending Coins: </b>{ trendingCoinsQuery.data }</p>
                            <p style={{ marginRight: '0.5rem' }}><b>Active Currencies: </b> { active_cryptocurrencies }</p>      
                            <p style={{ marginRight: '0.5rem' }}><b>Total Market Cap: </b> ${ (usd).toFixed(2) }</p>
                            <p style={{ marginRight: '0.5rem' }}><b>Market Dominance: </b> BTC { (btc).toFixed(2) + "%" } <b>|</b> ETH { (eth).toFixed(2) + "%" }</p>
                            <p style={{ marginBottom: '4rem', marginRight: '0.5rem' }}><b>24 Hour Market Cap % Change: </b>
                                <p style={{ display: 'inline', color: market_cap_change_percentage_24h_usd < 0 ? 'red' : 'green', fontWeight: 'bold'} }>
                                    { market_cap_change_percentage_24h_usd < 0 ? "" : "+" }{ (market_cap_change_percentage_24h_usd).toFixed(2) + "%" }
                                </p>
                            </p>
                            <div class="row">
                                <div class="col-md-6 p-3">
                                    <img src={ require("../../assets/images/bitcoin.svg").default } width="75" height="75" alt="logo" /><br /> 
                                    <h4>BTC</h4>
                                    <ChangeHighlight highlightClassName={ btcPriceCSSColourPicker } showAfter={ 100 } hideAfter={ 3000 }>
                                        <p>Price: <b ref={ btcPriceRef }>{ "$" + bitcoinPriceQuery.data[0].bitcoin.usd.toFixed(2) + " USD" }</b></p> 
                                    </ChangeHighlight>
                                    <p style={{ display: 'inline' }}>24 Hour % Change: </p> 
                                    <b><p style={{ display: 'inline', color: bitcoinPriceQuery.data[0].bitcoin.usd_24h_change < 0 ? 'red' : 'green' }}>
                                        { bitcoinPriceQuery.data[0].bitcoin.usd_24h_change < 0 ? bitcoinPriceQuery.data[0].bitcoin.usd_24h_change.toFixed(2) + "%": "+" + bitcoinPriceQuery.data[0].bitcoin.usd_24h_change.toFixed(2) + "%" }
                                        </p></b>
                                    <br />
                                    { isFreeVersion ? null : <button class="btn btn-outline-primary wallet-search-button" onClick={ bitcoinButtonHandler }>View Price Action &raquo;</button> }                                </div>
                                <div class="col-md-6 p-3">
                                    <img src={ require("../../assets/images/ethereum.svg").default } width="75" height="75" alt="logo" /><br />
                                    <h4>ETH</h4>
                                    <ChangeHighlight highlightClassName={ ethPriceCSSColourPicker } showAfter={ 100 } hideAfter={ 3000 }>
                                        <p>Price: <b ref={ ethPriceRef }>{ "$" + ethereumPriceQuery.data[0].ethereum.usd.toFixed(2) + " USD" }</b></p>
                                    </ChangeHighlight>
                                    <p style={{ display: 'inline' }}>24 Hour % Change: </p>
                                    <b><p style={{ display: 'inline', color: ethereumPriceQuery.data[0].ethereum.usd_24h_change < 0 ? 'red' : 'green' }}>
                                        { ethereumPriceQuery.data[0].ethereum.usd_24h_change < 0 ? ethereumPriceQuery.data[0].ethereum.usd_24h_change.toFixed(2) + "%": "+" + ethereumPriceQuery.data[0].ethereum.usd_24h_change.toFixed(2) + "%" }
                                        </p></b> 
                                    <br />
                                    { isFreeVersion ? null : <button class="btn btn-outline-primary wallet-search-button" onClick={ ethereumButtonHandler }>View Price Action &raquo;</button> }                                </div>
                            </div>
                        </div>
                </main>
            </div>
        )
    }
}

export default Home;