import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Line } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import { coinPricesByDay } from '../../UtilFunctions/coinPricesByDay';
import { metricsNavbarEthPrice } from '../../UtilFunctions/metricsNavbarEthPrice';
import { coinPricesByDayPro } from '../../UtilFunctions/coinPricesByDayPRO';
import { metricsNavbarEthPricePro } from '../../UtilFunctions/metricsNavbarEthPricePRO';
import { erc20CoinInfoPro } from '../../UtilFunctions/ERC20CoinInfoPRO';
import { erc20CoinPriceDurationPro } from '../../UtilFunctions/ERC20CoinPriceDurationPRO';
import Alert from '../Alert/Alert';
import ERC720PricesInfoTable from '../ERC720PricesInfoTable/ERC720PricesInfoTable';
import ChangeHighlight from 'react-change-highlight';
import './ERC720PricesPage.css';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ERC720TokenPricesPage = () => {
    const navigate = useNavigate();
    const [chartToggle, updateChartToggle] = useState("ethereum"); // Chart to display will be Ethereum by default
    const tokenContractAddress = useRef(); // useRef for keeping track of form input
    const [setTokenContractAddress, updateSetTokenContractAddress] = useState('');
    const [formAlert, updateAlert] = useState("");

    // Setting up queries for fetching and caching data
    const ethPriceQuery = useQuery({
      queryKey: ['eth price'],
      queryFn: metricsNavbarEthPricePro
    });

    const ethPriceDurationQuery = useQuery({
      queryKey: ['eth price duration', 'ethereum', 14],
      queryFn: coinPricesByDayPro
    });

    // Setting up a reference for token address instead, calls will be made for each character
    // React-Query identifies each query with its unique key
    const erc20TokenPriceQuery = useQuery({
      queryKey: ['ERC20 token information', setTokenContractAddress],
      queryFn: erc20CoinInfoPro
    });

    const erc20TokenPriceDurationQuery = useQuery({
      queryKey: ['ERC20 token price duration', setTokenContractAddress],
      queryFn: erc20CoinPriceDurationPro
    });

    const ethPriceRef = useRef(); // Track Ethereum price changes
   
    const clearHandler = () => {
      // Set toggle back to Ethereum
      updateChartToggle('ethereum');
      updateAlert("");
    }

    const formHandler = async (e) => {
      e.preventDefault();

      if (tokenContractAddress.current.value.length === 42 && tokenContractAddress.current.value.substring(0, 2) === "0x"){
        
        // Update and set token address to what was entered and update chart toggle
        updateSetTokenContractAddress(tokenContractAddress.current.value);
        updateChartToggle('erc20');
        updateAlert('');
      }
      else {
          if (formAlert === "invalid"){ // If the format is not of length 42 and start with 0x (hex), throw error
              e.target.reset();
          }
          else {
              updateAlert("invalid"); // If repeated multiple times, clear input and keep error as is
          }
      }
    }

    // Set display configurations
    var data = {
      labels: chartToggle === 'ethereum' ? ethPriceDurationQuery.data?.time : erc20TokenPriceDurationQuery.data?.time,
      datasets: [{
        label: chartToggle === 'ethereum' ? 'Ethereum Price' : 'Last Ten Price Points',
        data: chartToggle === 'ethereum' ? 
              ethPriceDurationQuery.data?.coinData.prices.map(x => x[1].toFixed(2)) : 
              erc20TokenPriceDurationQuery.data?.coinData.prices.map(x => x[1].toFixed(2)),
        backgroundColor: 'red',
        borderColor: 'red',
        borderWidth: 1
      }]
    };

    // Adding options to enhance charts
    var options = {
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: chartToggle === 'ethereum' ? 'Ethereum Chart' : erc20TokenPriceQuery.data?.name + ' Chart'
        },
        legend: {
          display: true,
          position: "bottom"
        }
      }
    }

    // Display Title, 24 Hr. Price% Change, Price of Coin
    if (ethPriceDurationQuery.isLoading || ethPriceQuery.isLoading || erc20TokenPriceDurationQuery.isLoading || erc20TokenPriceQuery.isLoading) {
      return <div role="main" className="p-3">Loading...</div>
    }
    else if (ethPriceDurationQuery.isError || ethPriceQuery.isError || erc20TokenPriceDurationQuery.isError || erc20TokenPriceQuery.isError) {
      return <div role="main" className="p-3">Error fetching Data...</div>
    }
    else {
      let ethPriceCSSColourPicker = chartToggle === 'Ethereum' && ethPriceRef.current === undefined ? '' : 
                                    ( ethPriceQuery.data[0].ethereum.usd >= Number(ethPriceRef.current?.innerHTML.substring(1)) ? 
                                      'tickerUpHighlight' : 'tickerDownHighlight'
                                    );

      // Generic coin setup using Object keys from API responses to generate output, code added when user requests a display of a valid ERC 20 token
      return (
        <div>
          <main role="main" className="p-3">
            <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
              <h2>ERC20 Token Market Data</h2>
            </div>
            { formAlert === "invalid" ? <div><Alert type="danger"/></div> : <div/> }
            <div class="jumbotron">
              <div class="container">
                <form onSubmit={ formHandler } style={{ marginTop: '1.5rem' }}>
                  <label style={{ marginRight: '0.5rem' }}>ERC20 Contract Address (Defaults to ETH): </label>
                  <input type="text" ref={ tokenContractAddress } placeholder="Enter here" required />
                  <br />
                  <button style={{ marginTop: '2rem' }} type="submit" class="btn btn-success">Check Data</button>
                </form>
                <div>
                  <button style={{ marginTop: '2rem', display: 'inline' }} class='btn btn-primary' onClick={ () => navigate("/") }>Go Home</button>
                  <button style={{ marginTop: '2rem', marginLeft: '2rem' }} class='btn btn-warning' onClick={ clearHandler }>Clear</button>              
                </div>
              </div>
            </div>
            { 
              formAlert === "invalid" ? null : 
                <> 
                  {
                    chartToggle === 'ethereum' ?                   
                      <ChangeHighlight highlightClassName={ ethPriceCSSColourPicker } showAfter={ 100 } hideAfter={ 3000 }>
                        <h3 style={{ marginTop: '5rem' }}>
                          { "Ethereum " } Price: 
                          <b ref={ ethPriceRef }>{ "$" + ethPriceQuery.data[0].ethereum.usd }</b>
                        </h3> 
                      </ChangeHighlight>
                    :
                      <h3 style={{ marginTop: '5rem' }}>
                        { erc20TokenPriceQuery.data.name } Price: 
                        <b>${ erc20TokenPriceQuery.data.market_data.current_price.usd }</b>
                      </h3> 
                  }
                  <h5 style={{ marginBottom: '2rem', display: 'inline' }}>24-Hr % Chg:
                    { chartToggle === 'ethereum' ? ( ethPriceQuery.data[0].ethereum.usd_24h_change < 0 ? 
                      <h5 style={{ display: 'inline', color: 'red' }}>{ " " + ethPriceQuery.data[0].ethereum.usd_24h_change.toFixed(2) + "%" }</h5> : 
                      <h5 style={{ display: 'inline', color: 'green' }}>{ " +" + ethPriceQuery.data[0].ethereum.usd_24h_change.toFixed(2) + "%" }</h5>
                    )
                    :
                    ( erc20TokenPriceQuery.data?.market_data.price_change_percentage_24h < 0 ?
                    <h5 style={{ display: 'inline', color: 'red' }}>{ " " + erc20TokenPriceQuery.data?.market_data.price_change_percentage_24h.toFixed(2) + "%" }</h5> : 
                    <h5 style={{ display: 'inline', color: 'green' }}>{ " +" + erc20TokenPriceQuery.data?.market_data.price_change_percentage_24h.toFixed(2) + "%" }</h5>
                    )
                    }
                  </h5>
                </> 
            }
            <div>
            { 
              formAlert !== 'invalid' ?
                <div style={{ marginTop: '2rem' }}>
                  <Line 
                    data={ data }
                    height={ 250 }
                    width={ 250 }
                    options={ options }
                  />
                </div> : null }
            </div>
            <div style={{ marginLeft: 'auto', marginRight: 'auto', width: '50%', marginTop: '3rem' }} >
              {
                // Display data of the valid ERC20 token
                chartToggle === 'ethereum' || formAlert === 'invalid' ? <div /> :
                <ERC720PricesInfoTable data={{ information: erc20TokenPriceQuery.data }} />
              }
            </div>
            { erc20TokenPriceQuery.data && formAlert !== 'invalid' ? <hr style={{ marginTop: '2rem', marginBottom: '2rem' }} /> : null }
          </main>
        </div>
      )
    }
}    

export default ERC720TokenPricesPage;