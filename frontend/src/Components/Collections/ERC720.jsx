import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import Alert from '../Alert/Alert';
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

    const [tokenContractAddress, updateContractAddress] = useState('0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe'); // Set default to EthDev contract address 
    const [formAlert, updateAlert] = useState("");

    const [coinInfo, updateCoinInfo] = useState({
      information: null
    });    
  
    const [chartData, setChartData] = useState({}); // Data for data points on chart

    // Update based on the toggle value afterwards, hence state will be used here
    const [astheticNaming, updateAstheticNaming] = useState("Ethereum"); // Naming for chart, default to Ethereum to start 
    
    const URL= "https://api.coingecko.com/api/v3";
    const ERC20_INFO_ENDPOINT = '/coins/ethereum/contract/' + tokenContractAddress;
    const ERC20_PRICE_ENDPOINT = '/coins/ethereum/contract/' + tokenContractAddress + '/market_chart?vs_currency=usd&days=0.05';

    /*
        useState(id.includes("-") ? 
                 id.split("-")[0].substring(0, 1).toUpperCase() + id.split("-")[0].substring(1, id.split("-")[0].length) : 
                 id.substring(0, 1).toUpperCase() + id.substring(1, id.length)); // Naming for chart 
    */

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


  const formHandler = async (e) => {
    e.preventDefault();

    if (tokenContractAddress.length === 42 && tokenContractAddress.substring(0, 2) === "0x"){

      // Fetch token contract address to check the value 
      await fetch(URL + ERC20_INFO_ENDPOINT)
      .then(response => response.json())
      .then(res => {
        if (res.error){
          updateAlert('invalid'); // Set alert if error is found to notify invalid contract address
          localStorage.clear();
        }
        else {
          updateAlert('');
          localStorage.setItem("contractAddress", tokenContractAddress); // Update storage to hold smart contract, if valid.
        }
      })
      .catch(err => {
        console.log(err); // Display error if contract is not found
        updateAlert('invalid');
        localStorage.clear();
      }); 
    }
    else {
        if (formAlert === "invalid"){ // If the format is not of length 42 and start with 0x (hex), throw error
            e.target.reset();
            localStorage.clear();                
        }
        else {
            updateAlert("invalid"); // If repeated multiple times, clear input and keep error as is
            localStorage.clear();
        }
    }
  }

  // Set display configurations
  var data = {
    labels: chartData?.time,
    datasets: [{
      label: astheticNaming + " Price",
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
          { formAlert === "invalid" ? <div><Alert type="danger"/></div> : <div/> }
          <h3 style={{marginTop: '2rem'}}>{astheticNaming + " "} Price: <b>${coinInfo.information[Object.keys(coinInfo.information)[0]].usd} USD</b></h3> 
          <h5 style={{marginBottom: '2rem', display: 'inline'}}>24 Hr. % Change:
            { coinInfo.information[Object.keys(coinInfo.information)[0]].usd_24h_change < 0 ? 
              <h5 style={{display: 'inline', color: 'red'}}>{" " + coinInfo.information[Object.keys(coinInfo.information)[0]].usd_24h_change.toFixed(2) + "%"}</h5> : 
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
          <form onSubmit={formHandler} style={{marginTop: '1.5rem'}}>
            <label style={{marginRight: '0.5rem'}}>ERC20 Contract Address: </label>
            <input type="text" onChange={(e) => updateContractAddress(e.target.value)} placeholder="Enter here" required />
            <br />
            <button style={{marginTop: '1rem'}} type="submit" class="btn btn-primary">Check Data</button>
          </form>
          <div>
            <button class="btn btn-success" style={{marginTop: '3rem'}} onClick={() => navigate("/")}>Go To Dashboard</button>
          </div>
        </main>
      </div>
    )
  }
}

export default ERC720;