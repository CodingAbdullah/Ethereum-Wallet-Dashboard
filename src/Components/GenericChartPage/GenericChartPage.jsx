import React, { useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useSelector, useDispatch } from 'react-redux';
import { coinPricesByDay } from '../../UtilFunctions/coinPricesByDay';
import { currentCoinPrice } from '../../UtilFunctions/currentCoinPrice';
import { coinPricesByDayPro } from '../../UtilFunctions/coinPricesByDayPRO';
import { currentCoinPricePro } from '../../UtilFunctions/currentCoinPricePRO';
import { selectCoin } from '../../redux/reducer/coinSelectionReducer';
import CoinSelector from '../CoinSelector/CoinSelector';
import ChangeHighlight from 'react-change-highlight';
import './GenericChartPage.css';

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
    const coinSelector = useSelector(state => state.coinSelection.coin); // Look at the global store for coin selection
    const dispatch = useDispatch(); // Set up dispatch for releasing Redux action functions
    const navigate = useNavigate();

    // 24 Hr % Change + Current Coin Price
   
    // Set it to 7 days by default
    const [interval, updateInterval] = useState(7);

    // Reference old coin price for determining highlight
    const coinPriceRef = useRef();

    const coinPriceQuery = useQuery({
      queryKey: ['coin', coinSelector, interval],
      queryFn: coinPricesByDayPro
    });

    const currentCoinPriceQuery = useQuery({
      queryKey: ['current coin price', coinSelector],
      queryFn: currentCoinPricePro
    });

    // Update based on the toggle value afterwards, hence state will be used here
    let astheticNaming = coinSelector.includes("-") ? 
                          coinSelector.split("-")[0].substring(0, 1).toUpperCase() + coinSelector.split("-")[0].substring(1, coinSelector.split("-")[0].length) : 
                          coinSelector.substring(0, 1).toUpperCase() + coinSelector.substring(1, coinSelector.length); // Naming for chart 

  // Set display configurations
  var coinData = {
    labels: coinPriceQuery.data?.time,
    datasets: [{
      label:  astheticNaming + ' Price',
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
        text: astheticNaming + " Chart"
      },
      legend: {
        display: true,
        position: "bottom"
      }
     }
  }

  let buttonDaysArray = ["Last 7 Days", "Last 14 Days", "Last 30 Days"];
  let buttons = buttonDaysArray.map((day, key) =>  {
    return <button id={ key } 
                   disabled={ day.includes(`${interval}`)} 
                   onClick={ e => { e.preventDefault(); updateInterval(Number(day.split(" ")[1])); }} // Split on space and fetch middle value which is a Number
                   style={{ marginTop: '2rem', marginRight: '1rem', marginBottom: '5rem', paddingLeft: '0.5rem', paddingRight: '0.5rem' }} 
                   className="btn btn-secondary">{ day }</button>
  });

  const selectHandler = (e) => {
    e.preventDefault();
    dispatch(selectCoin(e.target.value)); // Update global state handling coin selection
  }

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

    // Extract the previous coin price from the DOM
    let previousCoinPrice = Number(coinPriceRef.current?.innerHTML.split(" ")[0].substring(1));

    // Compare newly updated coin price to previous coin price to dynamically add CSS class
    let coinPriceCSSColourPicker = coinPriceRef.current === undefined ? "" : ( currentCoinPrice[objKey].usd >= previousCoinPrice ? "tickerUpHighlight" : "tickerDownHighlight" );
    
    return (
      <div>
        <main role="main">
            <ChangeHighlight highlightClassName={ coinPriceCSSColourPicker } showAfter={ 100 } hideAfter={ 3000 }>
              <h3 style={{ marginTop: '2rem' }}>{ astheticNaming + " " } Price: 
                <b ref={ coinPriceRef } style={{ marginLeft: '0.25rem' }}>
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
          <CoinSelector changeValue={ selectHandler } />
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

export default GenericChartPage;