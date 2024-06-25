import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { currentCoinPricePro } from '../../UtilFunctions/currentCoinPricePRO';
import { coinInfoPro } from '../../UtilFunctions/coinInfoPRO';
import { AgChartsReact } from 'ag-charts-react';
import axios from 'axios';
import DurationSelector from '../DurationSelector/DurationSelector';
import './GenericChartPage.css';

const GenericChartPage = () => {
    const [alert, updateAlert] = useState('');
    const coinSelector = useSelector(state => state.coinSelection.coin); // Look at the global store for coin selection

    // Price interval state
    const [interval, updateInterval] = useState('24');

    const navigate = useNavigate();

    // Interval handler function
    const intervalHandler = e => {
        updateInterval(e.target.value);
    }

    // State for fetching coin price data
    const [coinPrices, updateCoinPrices] = useState({
      prices: []
    });

    // Running request upon component initialization
    // Navigate away if the coin is not defined
    useEffect(() => {
      if (localStorage.getItem('coin') === null || localStorage.getItem('coin') === undefined || localStorage.getItem('coin') === '') {
        navigate('/prices');
      }

      const URL = 'http://localhost:5000';
      const COIN_PRICE_ENDPOINT = '/coin-prices-by-day';

      // Checking if token value is defined before proceeding with API call        
      let options = {
          method: "POST",
          body: JSON.stringify({ coin: coinSelector, interval }),
          headers: {
            'content-type' : 'application/json'
          }
      }
      
      // Request coin price information
      axios.post(URL + COIN_PRICE_ENDPOINT, options)
      .then(response => {
        updateCoinPrices(prevState => {
          return {
            ...prevState,
            prices: response.data.coinPrices
          }
        });
      })
      .catch(() => {
        updateAlert("invalid");
      });
    }, []);

    // Fetch data based on interval change
    useEffect(() => {
      const URL = 'http://localhost:5000';
      const COIN_PRICE_ENDPOINT = '/coin-prices-by-day';

      // Checking if token value is defined before proceeding with API call        
      let options = {
          method: "POST",
          body: JSON.stringify({ coin: coinSelector, interval }),
          headers: {
            'content-type' : 'application/json'
          }
      }
      
      // Request coin price information
      axios.post(URL + COIN_PRICE_ENDPOINT, options)
      .then(response => {
        updateCoinPrices(prevState => {
          return {
            ...prevState,
            prices: response.data.coinPrices
          }
        });
      })
      .catch(() => {
        updateAlert("invalid");
      });
    }, 
    [interval, updateInterval]);

    const coinInformationQuery = useQuery({
      queryKey: ['coin information', coinSelector],
      queryFn: coinInfoPro 
    });

    const currentCoinPriceQuery = useQuery({
      queryKey: ['current coin price', coinSelector],
      queryFn: currentCoinPricePro
    });

    // Display Title, 24 Hr. Price % Change, Price of Coin
    if (!coinPrices.prices || currentCoinPriceQuery.isLoading || coinInformationQuery.isLoading) {
      return <div role="main">Loading...</div>
    }
    else if (alert !== '' || currentCoinPriceQuery.isError || coinInformationQuery.isError) {
      return <div role="main">Could not load page due to error</div>
    }
    else if (coinPrices.prices.length === 0) {
      return <div role="main">No data available</div>
    }
    else {
      // Coin information, current price, and price duration data 
      // Format domains for each chart
      let information = coinInformationQuery.data[0];
      let currentPriceInformation = currentCoinPriceQuery.data[0][Object.keys(currentCoinPriceQuery.data[0])[0]];

      let minValue = Math.min(...coinPrices.prices.map(price => price.price));
      let maxValue = Math.max(...coinPrices.prices.map(price => price.price));

      return (
        <>
          <div className="ag-theme-quartz" style={{ height: 350, width: '100%' }}>
            <AgChartsReact options={{
                // Data: Data to be displayed in the chart
                data: coinPrices.prices,
                // Series: Defines which chart type and data to use
                series: [{ type: 'line', xName: 'Time', yName: 'Price', xKey: 'time', yKey: 'price' }],
                title: {
                    text:  `${information.name} Price: $${currentPriceInformation.usd} USD`
                },
                subtitle: {
                    text: `24 Hour % Change: ${currentPriceInformation.usd_24h_change >= 0 ? "+" + Number(currentPriceInformation.usd_24h_change).toFixed(2) + "%" : Number(currentPriceInformation.usd_24h_change).toFixed(2) + "%" }`
                },
                legend: {
                    enabled: true
                },
                axes: [
                    {
                        type: 'string',
                        position: 'bottom',
                        title: {
                            text: 'Time'
                        }
                    },
                    {
                        type: 'number',
                        position: 'left',
                        title: {
                            text: 'Price'
                        },
                        domain: [minValue, maxValue]
                    }
                ]
            }} />
          </div>
          <DurationSelector priceDurationHandler={ intervalHandler } />
        </>
      );
  }
}

export default GenericChartPage;