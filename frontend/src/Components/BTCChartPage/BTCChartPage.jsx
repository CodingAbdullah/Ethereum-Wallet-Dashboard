import React from 'react';
import { useEffect, useState } from 'react';
import { BitcoinChart } from '../BitcoinChart/BitcoinChart';
import axios from 'axios';
import { registerables } from 'chart.js';
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

  ChartJS.register(...registerables);

const BTCChartPage = () => {

    const URL= "https://api.coingecko.com/api/v3";
    const id = "bitcoin";
    const QUERY_STRING_BITCOIN = '?ids=bitcoin&vs_currencies=usd&include_24hr_change=true';
    const CURRENCY_ENDPOINT = '/simple/price';
    const QUERY_STRING_BITCOIN_PRICES = "?vs_currency=usd&days=14"; // Default selection for now.
    const BITCOIN_PRICE_ENDPOINT = "/coins/" + id + "/market_chart" + QUERY_STRING_BITCOIN_PRICES + "&interval=daily";
     
    const [btcPrice, updateBtcPrice] = useState(0.00);
    const [chartData, setChartData] = useState({});
    let days = [];

    // Default implementation for now... 14 days
    useEffect(() => {
        const fetchBitcoinData = async () => {
            let curr_prices = await axios.get(URL + BITCOIN_PRICE_ENDPOINT);
            let bitcoin_price = await axios.get(URL + CURRENCY_ENDPOINT + QUERY_STRING_BITCOIN);

            updateBtcPrice(bitcoin_price.data.bitcoin.usd);

            for (var i = 0; i <= 14; i++) {
                days.push(String(i + 1));
            }

            setChartData((prevState) => {
                return {
                    ...prevState,
                    labels: days,
                    datasets: [
                            {
                                label: "Price in USD",
                                data: curr_prices.data.prices.map(day => day[1].toFixed(2)),
                                fill: false,
                                backgroundColor: "red",
                                borderColor: "red",
                            }
                    ]
                }
            });
        }
        fetchBitcoinData();
    }, []);

    if (chartData === {}) {
        return <div>Loading...</div>
    }
    else {
        return (                        
                <div>
                    <h1>{btcPrice === 0.00 ? <div>Not uploaded yet</div> : "Bitcoin Current Price: $" + btcPrice + " USD"}</h1>
                    { chartData === {} ? <div>Loading...</div> : <BitcoinChart data={ chartData } />  }
                </div>
        );
    }
}

export default BTCChartPage;