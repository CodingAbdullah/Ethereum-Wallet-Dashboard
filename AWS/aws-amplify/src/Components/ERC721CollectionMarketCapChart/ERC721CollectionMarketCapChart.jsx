import { AgChartsReact } from 'ag-charts-react';
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid

const ERC721CollectionMarketCapChart = (props) => {
    const { marketCapData, name, interval } = props;

    // Set the y-axis to scale based on market cap data
    let minValue = Math.min(...marketCapData.map(data => data.price));
    let maxValue = Math.max(...marketCapData.map(data => data.price));
    
    return (
        <div className="ag-theme-quartz" style={{ height: 350, width: '100%' }}>
            <AgChartsReact options={{
                // Data: Data to be displayed in the chart
                data: marketCapData,
                // Series: Defines which chart type and data to use
                series: [{ type: 'line', xName:'Time', yName: 'Price', xKey: 'time', yKey: 'price' }],
                title: {
                    text:  `${name} Market Cap Activity`
                },
                subtitle: {
                    text: `Last ${interval} Days`
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

export default ERC721CollectionMarketCapChart;