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
  Legend,
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

    let days = [];
    for (var i = 0; i <= 14; i++) {
      days.push(String(i + 1));
    }

  // Get current coin prices as well as historical prices
  useEffect(() => {
    const fetchCoins = async () => {
      await fetch(URL + ETHEREUM_PRICE_ENDPOINT)
      .then(response => response.json())
      .then(res => {
        setChartData(prevState => {
          return {
            ...prevState,
            res
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
  }, [])

  // Set display configurations
  var data = {
    labels: days,
    datasets: [{
      label: `Ethereum Price`,
      data: chartData?.res?.prices?.map(x => x[1].toFixed(2)),
      backgroundColor: 'red',
      borderColor: 'red',
      borderWidth: 1,
      xAxisID: 'Days'
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

  // Display Title, 24 Hr. Price% Change, Price of Coin
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
            <h5 style={{display: 'inline', color: 'red'}}>{ethInfo.information.ethereum.usd_24h_change.toFixed(2) +"%"}</h5> : 
            <h5 style={{display: 'inline', color: 'green'}}>{" +" + ethInfo.information.ethereum.usd_24h_change.toFixed(2) + "%"}</h5>}
          </h5>
          <div>
            {( chartData === {} || days === [] ) ? <div>Loading...</div> : 
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
        </main>
      </div>
    )
  }
}

export default ETHChartPage;