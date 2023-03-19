import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import CoinSelector from '../CoinSelector/CoinSelector';
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

const MaticPricePage = () => {
    const navigate = useNavigate();

    // Check to see if the parameters exist and are valid, run to check prices, selection area for the different coins
    const URL= "https://api.coingecko.com/api/v3";
    const QUERY_STRING = '?ids=matic-network' + '&vs_currencies=usd&include_24hr_change=true';
    const CURRENCY_ENDPOINT = '/simple/price';
    const QUERY_STRING_PRICES = "?vs_currency=usd&days=14"; // Default selection for now.
    const PRICE_ENDPOINT = "/coins/matic-network/market_chart" + QUERY_STRING_PRICES + "&interval=daily";

    const [coinInfo, updateCoinInfo] = useState({
      information: null
    });    
  
    const [chartData, setChartData] = useState({}); // Data for data points on chart
    const [displayChart, updateDisplayChart] = useState('15'); // Display chart dates, default set to 15
    const [selectRequest, updateSelectRequest] = useState("matic-network"); // Default set to bitcoin
    const [toggleSelect, updateToggleSelect] = useState(0); // Use a counter instead

    useEffect(() => {
      const fetchCoins = async () => {      
        await fetch(URL + PRICE_ENDPOINT) // Get coin price data information
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

  // Dependency is used to update chart rendering each case is considered and a separate API call is made for each scenario
  useEffect(() => {
    const fetchCoins = async (value) => {      
      // Update Naming
      if (value === '14'){
        await fetch(URL + "/coins/matic-network/market_chart" + QUERY_STRING_PRICES + "&interval=daily")
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
      }
      else if (value === '30'){
        await fetch(URL + "/coins/matic-network/market_chart?vs_currency=usd&days=30&interval=daily") // Generic id setup
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
      }
      else {
        await fetch(URL + "/coins/matic-network/market_chart?vs_currency=usd&days=1&interval=hourly") // Generic id setup
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
      }

       // Current coin price 
       await fetch(URL + CURRENCY_ENDPOINT + '?ids=matic-network&vs_currencies=usd&include_24hr_change=true') // Get current coin price
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
    }
    fetchCoins(displayChart);
  }, [displayChart, toggleSelect]); // Dependencies will be both toggle and what day to display. Re-render on each request

  // Set display configurations
  var data = {
    labels: chartData?.time,
    datasets: [{
      label:  'Matic Price',
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
        text: 'Matic Chart'
      },
      legend: {
        display: true,
        position: "bottom"
      }
     }
  }

  let buttonDaysArray = ["Last Day", "Last 14 Days", "Last 30 Days"];
  let buttons = buttonDaysArray.map((day, key) =>  {
    return <button id={ key } onClick={ () => buttonHandler(day) } style={{ marginTop: '2rem', marginRight: '1rem', marginBottom: '5rem', paddingLeft: '0.5rem', paddingRight: '0.5rem' }} class="btn btn-secondary">{ day }</button>
  });

  const selectHandler = (e) => {
    updateSelectRequest(e.target.value);

    let count = toggleSelect;
    updateToggleSelect(count + 1);
  }

  // Display Title, 24 Hr. Price% Change, Price of Coin
  if (coinInfo.information === null || chartData === {}) {
    return <div role="main">Loading...</div>
  }
  else {
    // Generic coin setup using Object keys from API responses to generate output
    return (
      <div>
        <main role="main">
          <h3 style={{ marginTop: '2rem' }}>Matic Price: 
            <b style={{ marginLeft: '0.25rem' }}>
              ${ coinInfo.information[Object.keys(coinInfo.information)[0]].usd >= 1 ? 
              (coinInfo.information[Object.keys(coinInfo.information)[0]].usd).toFixed(2) : 
               coinInfo.information[Object.keys(coinInfo.information)[0]].usd } USD
            </b>
          </h3> 
          <h5 style={{ marginBottom: '2rem', display: 'inline' }}>24-Hr % Chg:
            { coinInfo.information[Object.keys(coinInfo.information)[0]].usd_24h_change < 0 ? 
              <h5 style={{ display: 'inline', color: 'red' }}>{ " " + coinInfo.information[Object.keys(coinInfo.information)[0]].usd_24h_change.toFixed(2) +"%" }</h5> : 
              <h5 style={{ display: 'inline', color: 'green' }}>{ " +" + coinInfo.information[Object.keys(coinInfo.information)[0]].usd_24h_change.toFixed(2) + "%" }</h5>
            }
            </h5>
          <br />
          <CoinSelector changeValue={ selectHandler } />
          <div>
            {( chartData === {} || chartData.time === [] ) ? <div>Loading...</div> : 
              <div style={{ marginTop: '2rem' }}>
                <Line 
                  data={ data }
                  height={ 250 }
                  width={ 250 }
                  options={ options }
                />
              </div>
            }
          </div>
          <div class="button-section" style={{ marginTop: '1rem', marginLeft: '1rem' }}>
            { buttons }
          </div>
          <div>
            <button class="btn btn-success" style={{ marginRight: '0.25rem' }} onClick={ () => navigate("/") }>Go To Dashboard</button>
          </div>
        </main>
      </div>
    )
  }
}

export default MaticPricePage;