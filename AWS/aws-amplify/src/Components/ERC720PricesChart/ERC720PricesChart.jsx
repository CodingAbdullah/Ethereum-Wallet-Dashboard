import { useState } from 'react';
import { AgChartsReact } from 'ag-charts-react';
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid

const ERC720PricesChart = (props) => {
    const { coinInformation, priceData, tokenPrice } = props;

    // Set the y-axis to scale based on price data
    let minValue = Math.min(...priceData.map(price => price.price));
    let maxValue = Math.max(...priceData.map(price => price.price));
    
    return (
        <div className="ag-theme-quartz" style={{ height: 350, width: '100%' }}>
            <AgChartsReact options={{
                // Data: Data to be displayed in the chart
                data: priceData,
                // Series: Defines which chart type and data to use
                series: [{ type: 'line', xName:'Time', yName: 'Price', xKey: 'time', yKey: 'price' }],
                title: {
                    text:  `${coinInformation.name} Price: $${tokenPrice} USD`
                },
                subtitle: {
                    text: `24 Hour % Change: ${coinInformation.market_data.price_change_percentage_24h >= 0 ? "+" + coinInformation.market_data.price_change_percentage_24h.toFixed(2) + "%" : coinInformation.market_data.price_change_percentage_24h.toFixed(2) + "%"}`
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
    );
}

export default ERC720PricesChart;