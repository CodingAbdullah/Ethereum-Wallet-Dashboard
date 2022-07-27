import React from 'react';
import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
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

const ETHChartPortal = () => {

    const URL= "https://api.coingecko.com/api/v3";
    const id = "ethereum";
    const QUERY_STRING = "?vs_currency=usd&days=14"; // Default selection for now.
    const API_ENDPOINT = "/coins/" + id + "/market_chart" + QUERY_STRING + "&interval=daily";

    const [chartData, setChartData] = useState({});
    let days = [];

    // Default implementation for now... 14 days
    useEffect(() => {
        const fetchEthereumData = async () => {
            let res = await axios.get(URL + API_ENDPOINT);

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
                                data: res.data.prices.map(day => day[1].toFixed(2)),
                                fill: false,
                                backgroundColor: "red",
                                borderColor: "red",
                                xAxisID: 'Days'
                            }
                    ]
                }
            })
        }
        fetchEthereumData();
    }, []);

    return (                        
            
            <div class="dashboard d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                { chartData === {} ? <div>Loading</div> : <Line data={chartData} />  }
            </div>
    )
}

export default ETHChartPortal;