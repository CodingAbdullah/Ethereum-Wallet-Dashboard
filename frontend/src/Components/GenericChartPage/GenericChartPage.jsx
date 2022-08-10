import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { useNavigate, useLocation } from 'react-router-dom';
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

const GenericChartPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const coinRequest = location.state.coin; // Grab the parameter value

    // Check to see if the parameters exist and are valid, run to check prices, selection area for the different coins
    const URL= "https://api.coingecko.com/api/v3";

    const id = coinRequest === undefined ? 'bitcoin' : coinRequest; // Default to bitcoin if the value is not defined

    let astheticNaming = id.includes("-") ? 
                         id.split("-")[0].substring(0, 1).toUpperCase() + id.split("-")[0].substring(1, id.split("-")[0].length) : 
                         id.substring(0, 1).toUpperCase() + id.substring(1, id.length); // Naming for chart 

    const QUERY_STRING = '?ids=' + id + '&vs_currencies=usd&include_24hr_change=true';
    const CURRENCY_ENDPOINT = '/simple/price';
    const QUERY_STRING_PRICES = "?vs_currency=usd&days=14"; // Default selection for now.
    const PRICE_ENDPOINT = "/coins/" + id + "/market_chart" + QUERY_STRING_PRICES + "&interval=daily";

    const [coinInfo, updateCoinInfo] = useState({
      information: null
    });    
  
    const [chartData, setChartData] = useState({}); // Data for data points on chart
    const [displayChart, updateDisplayChart] = useState('15'); // Display chart dates, default set to 15
    const [selectRequest, updateSelectRequest] = useState("bitcoin"); // Default set to bitcoin

  // Get current coin prices as well as historical prices
  useEffect(() => {
    const fetchCoins = async () => {      
      await fetch(URL + PRICE_ENDPOINT) // Get coin price data information
      .then(response => response.json())
      .then(res => {
        setChartData(prevState => {
          let days = [];
          for (var i = 1; i < 31; i++){
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

      await fetch(URL + CURRENCY_ENDPOINT + QUERY_STRING) // Get current coin price
      .then(response => response.json())
      .then(res => {
        if (res[Object.keys(res)[0]] !== undefined) { // Get coin value from generic setup res.ethereum, res.binance ... and so on
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

    // Buttons for displaying different chart date ranges, used to update the diplay chart date, which triggers a re-render
    const buttonHandler = (d) => {
      switch(d) {
        case "Last Day":
          updateDisplayChart("1");
          break;
          
        case "Last 14 Days":
          updateDisplayChart("14");
          break;
  
        case "Last 30 Days":
          updateDisplayChart("30");
          break;
  
        default:
          break;
      }
    }

    const selectHandler = (v) => {
      switch(v.value){
        case "avalanche-2":
          updateSelectRequest('avalanche-2');
          break;
        case "binancecoin":
          updateSelectRequest('binancecoin');
          break;
        case "binance-usd":
          updateSelectRequest('binance-usd');
          break;
        case 'bitcoin':
          updateSelectRequest('bitcoin');
          break;
        case 'cardano':
          updateSelectRequest('cardano');
          break;
        case 'dai':
          updateSelectRequest('dai');
          break;
        case 'dogecoin':
          updateSelectRequest('dogecoin');
          break;
        case 'ethereum':
          updateSelectRequest('ethereum');
          break;
        case 'matic-network':
          updateSelectRequest('matic-network');
          break;
        case 'polkadot':
          updateSelectRequest('polkadot');
          break;
        case 'ripple':
          updateSelectRequest('ripple');
          break;
        case 'shiba-inu':
          updateSelectRequest('shiba-inu');
          break;
        case 'solana':
          updateSelectRequest('solana');
          break;
        case 'uniswap':
          updateSelectRequest('uniswap');
          break;
        case 'usd':
          updateSelectRequest('usd');
          break;
        default:
          break;
      }
    }

  // Dependency is used to update chart rendering each case is considered and a separate API call is made for each scenario
  useEffect(() => {
    const fetchCoins = async (value) => {
      if (value === '14'){
        await fetch(URL + PRICE_ENDPOINT)
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
      }
      else if (value === '30'){
        await fetch(URL + "/coins/" + id +  "/market_chart?vs_currency=usd&days=30&interval=daily") // Generic id setup
        .then(response => response.json())
        .then(res => {
          setChartData(prevState => {
            let days = [];
            for (var i = 1; i < 31; i++){
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
      }
      else {
        await fetch(URL + "/coins/" + id + "/market_chart?vs_currency=usd&days=1&interval=hourly") // Generic id setup
        .then(response => response.json())
        .then(res => {
          setChartData(prevState => {
            let days = [];
            for (var i = 1; i < 25; i++){
              days.push(moment().subtract(i, 'hours').calendar());
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
      }
    }
    fetchCoins(displayChart);
  }, [displayChart]);


  // Selection based on coin
  useEffect(() => {
    const fetchCoins = async (value) => {
        await fetch(URL + "/coins/" + value + "/market_chart?vs_currency=usd&days=1&interval=hourly") // Generic id setup
        .then(response => response.json())
        .then(res => {
          setChartData(prevState => {
            let days = [];
            for (var i = 1; i < 25; i++){
              days.push(moment().subtract(i, 'hours').calendar());
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
    }
    fetchCoins(selectRequest);
  }, [selectRequest]);


  // Set display configurations
  var data = {
    labels: chartData?.time,
    datasets: [{
      label:  astheticNaming + ' Price',
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
        text: "Chart"
      },
      legend: {
        display: true,
        position: "bottom"
      }
     }
  }

  let buttonDaysArray = ["Last Day", "Last 14 Days", "Last 30 Days"];
  let buttons = buttonDaysArray.map(day =>  {
    return <button onClick={() => buttonHandler(day)} style={{marginTop: '2rem', marginRight: '1rem', marginBottom: '5rem', paddingLeft: '0.5rem', paddingRight: '0.5rem'}} class="btn btn-secondary">{day}</button>
  });

  // Display Title, 24 Hr. Price% Change, Price of Coin
  if (coinInfo.information === null || chartData === {}) {
    return <div>Loading...</div>
  }
  else {
    // Generic coin setup using Object keys from API responses to generate output
    return (
      <div>
        <main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-md-4">
          <h3 style={{marginTop: '2rem'}}>{astheticNaming + " "} Price: <b>${coinInfo.information[Object.keys(coinInfo.information)[0]].usd} USD</b></h3> 
          <h5 style={{marginBottom: '2rem', display: 'inline'}}>24 Hr. % Change: 
            { coinInfo.information[Object.keys(coinInfo.information)[0]].usd_24h_change < 0 ? 
              <h5 style={{display: 'inline', color: 'red'}}>{" " + coinInfo.information[Object.keys(coinInfo.information)[0]].usd_24h_change.toFixed(2) +"%"}</h5> : 
              <h5 style={{display: 'inline', color: 'green'}}>{" +" + coinInfo.information[Object.keys(coinInfo.information)[0]].usd_24h_change.toFixed(2) + "%"}</h5>
            }
          </h5>
          <br />
          <label style={{marginRight: '0.5rem'}}>Select a coin: </label>

          <select style={{marginTop: '2rem'}} onchange={() => selectHandler(this)} name="coinSelector">
            <option value="avalanche-2">Avalanche</option>
            <option value="binancecoin">Binance</option>
            <option value="binance-usd">Binance USD</option>
            <option value="bitcoin">Bitcoin</option>
            <option value="cardano">Cardano</option>
            <option value="dai">Dai</option>
            <option value="dogecoin">Dogecoin</option>
            <option value="ethereum">Ethereum</option>
            <option value="matic-network">Polygon</option>
            <option value="solana">Solana</option>
            <option value="shiba-inu">Shiba Inu</option>
            <option value="ripple">Ripple</option>
            <option value="polkadot">Polkadot</option>
            <option value="uniswap">Uniswap</option>
            <option value="usd">USD</option>
          </select>
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
          <div class="button-section" style={{marginTop: '1rem'}}>
            {buttons}
          </div>
          <div>
            <button class="btn btn-success" onClick={() => navigate("/")}>Go To Dashboard</button>
          </div>
        </main>
      </div>
    )
  }
}

export default GenericChartPage;