import React, { useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { coinPricesByDay } from '../../UtilFunctions/coinPricesByDay';
import { currentCoinPrice } from '../../UtilFunctions/currentCoinPrice';
import { coinPricesByDayPro } from '../../UtilFunctions/coinPricesByDayPRO';
import { currentCoinPricePro } from '../../UtilFunctions/currentCoinPricePRO';
import ChangeHighlight from 'react-change-highlight';
import './ArbitrumPricePage.css';

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

const ArbitrumPricePage = () => {
    const navigate = useNavigate();

    // Set it to 7 days by default
    const [interval, updateInterval] = useState(7);

    const coinPriceQuery = useQuery({
      queryKey: ['coin', 'arbitrum', interval],
      queryFn: coinPricesByDayPro
    });

    const currentCoinPriceQuery = useQuery({
      queryKey: ['current coin price', 'arbitrum'],
      queryFn: currentCoinPricePro
    });

    // Arbitrum coin price reference
    const arbPriceRef = useRef();

    // Set display configurations
    var coinData = {
      labels: coinPriceQuery.data?.time,
      datasets: [{
        label: 'Arbitrum Price',
        data: coinPriceQuery.data?.coinData.prices.map(x => x[1].toFixed(2)),
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
          text: "Arbitrum Chart"
        },
        legend: {
          display: true,
          position: "bottom"
        }
      }
    }

    let buttonDaysArray = ["Last 7 days", "Last 14 Days", "Last 30 Days"];
    let buttons = buttonDaysArray.map((day, key) =>  {
      return <button id={ key } 
                    disabled={ day.includes(`${interval}`)} 
                    onClick={ e => { e.preventDefault(); updateInterval(Number(day.split(" ")[1])); }} // Split on space and fetch middle value which is a Number
                    style={{ marginTop: '2rem', marginRight: '1rem', marginBottom: '5rem', paddingLeft: '0.5rem', paddingRight: '0.5rem' }} 
                    className="btn btn-secondary">{ day }</button>
    });

    // Display Title, 24 Hr. Price% Change, Price of Coin
    if (coinPriceQuery.isLoading || currentCoinPriceQuery.isLoading) {
      return <div role="main">Loading...</div>
    }
    else if (coinPriceQuery.isError || currentCoinPriceQuery.isError) {
      return <div role="main">Could not load page due to error</div>
    }
    else if (coinPriceQuery.data && currentCoinPriceQuery.data){
      // Generic coin setup using Object keys from API responses to generate output
      let currentCoinPrice = currentCoinPriceQuery.data[0];
      let objKey = Object.keys(currentCoinPriceQuery.data[0])[0];

      // Retrieve previous coin price for price highlighting
      let previousArbPrice = Number(arbPriceRef.current?.innerHTML.split(" ")[0].substring(1));

      // ARB coin price CSS colour picker
      let arbPriceCSSColourPicker = arbPriceRef.current === undefined ? "" : ( currentCoinPrice[objKey].usd >= previousArbPrice ? "tickerUpHighlight" : 'tickerDownHighlight' );
      
      return (
        <div>
          <main role="main">
              <ChangeHighlight highlightClassName={ arbPriceCSSColourPicker } showAfter={ 100 } hideAfter={ 3000 }>
                <h3 style={{ marginTop: '2rem' }}>{"Arbitrum " } Price: 
                  <b ref={ arbPriceRef } style={{ marginLeft: '0.25rem' }}>
                    { 
                      currentCoinPrice[objKey].usd >= 1 ? 
                      "$" + currentCoinPrice[objKey].usd.toFixed(2) + " USD" : 
                      "$" + currentCoinPrice[objKey].usd + " USD"
                    }
                  </b>
                </h3> 
              </ChangeHighlight>
            <h5 style={{ marginBottom: '2rem', display: 'inline' }}>24-Hr % Chg:
              { 
                currentCoinPrice[objKey].usd_24h_change < 0 ? 
                  <h5 style={{ display: 'inline', color: 'red' }}>{ " " + currentCoinPrice[objKey].usd_24h_change.toFixed(2) + "%" }</h5> : 
                  <h5 style={{ display: 'inline', color: 'green' }}>{ " +" + currentCoinPrice[objKey].usd_24h_change.toFixed(2) + "%" }</h5>
              }
              </h5>
            <br />
            <div>
              <div style={{ marginTop: '2rem' }}>
                <Line 
                  data={ coinData }
                  height={ 250 }
                  width={ 250 }
                  options={ options }
                />
              </div>
            </div>
            <div className="button-section" style={{ marginTop: '1rem', marginLeft: '1rem' }}>
              { buttons }
            </div>
            <div>
              <button className="btn btn-success" style={{ marginRight: '0.25rem' }} onClick={ () => navigate("/") }>Go To Dashboard</button>
            </div>
          </main>
        </div>
      )
    }
}

export default ArbitrumPricePage;