import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

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


/*
    --- THINGS TO GET ---

    [res. will contain all this information] /coin/ethereum/contract/<contract address>
    contract_address
    last_updated
    total_supply
    max_supply
    circulating_supply
    price_change_percentage_24h: 6.48391
    high_24h.usd
    low_24h.usd
    atl.usd atl_date.usd
    ath.usd ath_date.usd
    ath_change_percentage.usd
    ath.usd ath_date.usd
    market_data.current_price.usd

    (only allow for display of 1 chart, with table containing the rest of the information)
    [res. will contain all this information] /coin/ethereum/contract/<contract address>/market_chart?vs_currency=usd&days=1

    { prices: [[1, 2], [1, 2], [1, 2] and so on...] }
*/

const ERC720 = () => {
    const navigate = useNavigate();

    const URL= "https://api.coingecko.com/api/v3";
    const [tokenContractAddress, updateContractAddress] = useState('0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe'); // Set default to EthDev contract address 
    const ERC20_INFO_ENDPOINT = '/coin/ethereum/contract/' + tokenContractAddress;
    const ERC20_PRICE_ENDPOINT = '/coin/ethereum/contract/' + tokenContractAddress + '/market_chart?vs_currency=usd&days=0.05';

    const [coinInfo, updateCoinInfo] = useState({
      information: null
    });    
  
    const [chartData, setChartData] = useState({}); // Data for data points on chart

    // Update based on the toggle value afterwards, hence state will be used here
    const [astheticNaming, updateAstheticNaming] = useState("Ethereum"); // Naming for chart, default to Ethereum to start 
    
    // Get Ethereum data initially
    useEffect(() => {
      const fetchCoins = async () => {      
        await fetch(URL + "/coins/ethereum/market_chart?vs_currency=usd&days=14&interval=daily")
        .then(response => response.json())
        .then(res => {
          setChartData(prevState => {
            let days = [];
            for (var i = 1; i < 15; i++){
                days.push(moment().subtract(i, 'days').calendar());
            }
            return {
              ...prevState,
              res,
              time: days.reverse()
            }
          });
        })
        .catch((error) => {
          console.log(error);
        });

        // Get current ETH price
        await fetch(URL + "/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true") 
        .then(response => response.json())
        .then(res => {
          if (res.ethereum !== undefined) { // Since we are getting ETH initially, res.ethereum
            updateCoinInfo((prevState) => {
                return {
                    ...prevState,
                    information: res
                }
            });
          }
        })
        .catch(err => {
          console.log(err);
        });
      };
      fetchCoins();
    }, [])


  // Set display configurations
  var data = {
    labels: chartData?.time,
    datasets: [{
      label: astheticNaming + ' Price',
      data: chartData?.res?.prices?.map(x => x[1].toFixed(2)),
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
        text: astheticNaming + " Chart"
      },
      legend: {
        display: true,
        position: "bottom"
      }
     }
  }

  // Display Title, 24 Hr. Price% Change, Price of Coin
  if (coinInfo.information === null || chartData === {}) {
    return <div>Loading...</div>
  }
  else {
    // Generic coin setup using Object keys from API responses to generate output
    return (
      <div>
        <main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-md-4">
          <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h2>ERC20 Market Data</h2>
          </div>
          <h3 style={{marginTop: '2rem'}}>{astheticNaming + " "} Price: <b>${coinInfo.information[Object.keys(coinInfo.information)[0]].usd} USD</b></h3> 
          <h5 style={{marginBottom: '2rem', display: 'inline'}}>24 Hr. % Change:
            { coinInfo.information[Object.keys(coinInfo.information)[0]].usd_24h_change < 0 ? 
              <h5 style={{display: 'inline', color: 'red'}}>{" " + coinInfo.information[Object.keys(coinInfo.information)[0]].usd_24h_change.toFixed(2) +"%"}</h5> : 
              <h5 style={{display: 'inline', color: 'green'}}>{" +" + coinInfo.information[Object.keys(coinInfo.information)[0]].usd_24h_change.toFixed(2) + "%"}</h5>
            }
          </h5>
          <br />
          <div>
            {( chartData === {} || chartData.time === [] ) ? <div>Loading...</div> : 
              <div style={{marginTop: '2rem'}}>
                <Line 
                  data={data}
                  height={250}
                  width={250}
                  options={options}
                />
              </div>
            }
          </div>
          <div>
            <button class="btn btn-success" style={{marginTop: '2rem'}} onClick={() => navigate("/")}>Go To Dashboard</button>
          </div>
        </main>
      </div>
    )
  }
}

export default ERC720;