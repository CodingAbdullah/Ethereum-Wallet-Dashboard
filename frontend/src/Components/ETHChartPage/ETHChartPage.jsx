import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';

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

const ETHChartPage = () => {
    const URL= "https://api.coingecko.com/api/v3";
    const id = "ethereum";
    const QUERY_STRING_ETHEREUM = '?ids=ethereum&vs_currencies=usd&include_24hr_change=true';
    const CURRENCY_ENDPOINT = '/simple/price';
    const QUERY_STRING_ETHEREUM_PRICES = "?vs_currency=usd&days=14"; // Default selection for now.
    const ETHEREUM_PRICE_ENDPOINT = "/coins/" + id + "/market_chart" + QUERY_STRING_ETHEREUM_PRICES + "&interval=daily";
     
    const [ethInfo, updateEthInfo] = useState({
      information: null
    });    
  
    const [chartData, setChartData] = useState({});
    const [displayChart, updateDisplayChart] = useState('15');

  // Get current coin prices as well as historical prices
  useEffect(() => {
    const fetchCoins = async () => {
      await fetch(URL + ETHEREUM_PRICE_ENDPOINT)
      .then(response => response.json())
      .then(res => {
        setChartData(prevState => {
          return {
            ...prevState,
            res,
            time: [1, 2, 3, 4, 5, 6, 7, 8, 9 , 10, 11, 12, 13, 14, 15]
          }
        });
      })
      .catch((error) => {
        console.log(error);
      });

      await fetch(URL + CURRENCY_ENDPOINT + QUERY_STRING_ETHEREUM)
      .then(response => response.json())
      .then(res => {
        if (res.ethereum !== undefined) {
            updateEthInfo((prevState) => {
              return {
                  ...prevState,
                  information: res
              }
            });
        }
      })
      .catch(err => {
        console.log(err);
      })
    };
    fetchCoins();
  }, []);

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
      if (value === '14'){
        await fetch(URL + ETHEREUM_PRICE_ENDPOINT)
        .then(response => response.json())
        .then(res => {
          setChartData(prevState => {
            return {
              ...prevState,
              res,
              time: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
            }
          });
        })
        .catch((error) => {
          console.log(error);
        });
      }
      else if (value === '30'){
        await fetch(URL + "/coins/ethereum/market_chart?vs_currency=usd&days=30&interval=daily")
        .then(response => response.json())
        .then(res => {
          setChartData(prevState => {
            return {
              ...prevState,
              res,
              time: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 
                16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]
            }
          });
        })
        .catch((error) => {
          console.log(error);
        });
      }
      else {
        await fetch(URL + "/coins/ethereum/market_chart?vs_currency=usd&days=1&interval=hourly")
        .then(response => response.json())
        .then(res => {
          setChartData(prevState => {
            return {
              ...prevState,
              res,
              time: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 
                16, 17, 18, 19, 20, 21, 22, 23, 24, 25]
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

    // Set display configurations
    var data = {
      labels: chartData?.time,
      datasets: [{
        label: `Ethereum Price`,
        data: chartData?.res?.prices?.map(x => x[1].toFixed(2)),
        backgroundColor: 'red',
        borderColor: 'red',
        borderWidth: 1
      }]
    };
  
    // Adding options to enhance charts
    var options = {
      maintainAspectRatio: false,
      scales: {
      },
      legend: {
        display: true,
        position: "bottom",
        labels: {
          fontSize: 25
        }
      }
    }
    
  let buttonDaysArray = ["Last Day", "Last 14 Days", "Last 30 Days"];
  let buttons = buttonDaysArray.map(day =>  {
    return <button onClick={() => buttonHandler(day)} style={{marginRight: '1rem', paddingLeft: '0.5rem', paddingRight: '0.5rem'}} class="btn btn-secondary">{day}</button>
  });

  // Display Title, 24 Hr. % Change, Price of Coin
  if (ethInfo.information === null || chartData === {}) {
    return <div>Loading...</div>
  }
  else {
    return (
      <div>
        <main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-md-4">
          <h3 style={{marginTop: '2rem'}}>Ethereum Price: <b>${ethInfo.information.ethereum.usd} USD</b></h3> 
          <h5 style={{marginBottom: '2rem', display: 'inline'}}>24 Hr. % Change: 
            { ethInfo.information.ethereum.usd_24h_change < 0 ? 
              <h6 style={{display: 'inline', color: 'red'}}>{ethInfo.information.ethereum.usd_24h_change.toFixed(2) + "%"}</h6> : 
              <h6 style={{display: 'inline', color: 'green'}}>{" +" + ethInfo.information.ethereum.usd_24h_change.toFixed(2) + "%"}</h6>
            }
          </h5>
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
        </main>
      </div>
    )
  }
}

export default ETHChartPage;