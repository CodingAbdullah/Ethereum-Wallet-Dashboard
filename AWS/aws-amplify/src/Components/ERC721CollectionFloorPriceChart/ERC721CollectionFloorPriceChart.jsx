import { AgChartsReact } from 'ag-charts-react';
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid

const ERC721CollectionFloorPriceChart = (props) => {
    const { floorPriceData, name, interval } = props;

    // Set the y-axis to scale based on floor price data
    let minValue = Math.min(...floorPriceData.map(data => data.price));
    let maxValue = Math.max(...floorPriceData.map(data => data.price));
    
    return (
        <div className="ag-theme-quartz" style={{ height: 350, width: '100%' }}>
            <AgChartsReact options={{
                // Data: Data to be displayed in the chart
                data: floorPriceData,
                // Series: Defines which chart type and data to use
                series: [{ type: 'line', xName:'Time', yName: 'USD', xKey: 'time', yKey: 'price' }],
                title: {
                    text:  `${name} Floor Activity (USD)`
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

export default ERC721CollectionFloorPriceChart;