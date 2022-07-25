import React from 'react';
import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';

const BTCChartPortal = () => {

    const time = ["1 day", "14 days", "30 days"];
    const URL= "https://api.coingecko.com/api/v3";
    const id = "bitcoin";
    const QUERY_STRING = "?vs_currency=usd&days=14"; // Default selection for now.
    const API_ENDPOINT = "/coins/" + id + "/market_chart" + QUERY_STRING + "&interval=daily";

    const [chartData, setChartData] = useState({});

    // Default implementation for now.. 14 days
    useEffect(() => {
        fetch(URL + API_ENDPOINT)
        .then(response => response.json())
        .then(res => {
            setChartData(prevState => {
                return {
                    ...prevState,
                    labels: ['1', '2', '3', '4', '5', '6','7','8','9','10', '11', '12', '13', '14', '15'],
                    datasets: [
                    {
                        label: "Price in USD",
                        data: res.prices.map((btcInfo) => btcInfo[1]),
                        backgroundColor: [
                            "#ff0000",
                            "#ff0000",
                            "#ff0000",
                            "#ff0000",
                            "#ff0000",
                            "#ff0000",
                            "#ff0000",
                            "#ff0000",
                            "#ff0000",
                            "#ff0000",
                            "#ff0000",
                            "#ff0000",
                            "#ff0000",
                            "#ff0000",
                            "#ff0000"
                        ]
                    }]
                }
            }); 
        })
        .catch(err => console.log(err));
    }, []);

    return (
        <div className='dashboard'>
            <div>
                { time.map(element => { 
                    return (
                        <button style={{ marginTop: '1rem', marginRight: '1rem', marginBottom: '0.4rem' }} class="btn btn-secondary">{element}</button>
                    );
                })}
                <div>
                    <Line
                        data={chartData}
                        options={{
                            plugins: {
                                title: {
                                display: true,
                                text: "Bticoin Chart"
                                },
                                legend: {
                                display: true,
                                position: "bottom"
                            }
                        }
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

export default BTCChartPortal;