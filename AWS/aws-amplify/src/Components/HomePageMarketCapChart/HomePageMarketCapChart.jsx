import { AgChartsReact } from 'ag-charts-react';
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid

const HomePageMarketCapChart = (props) => {
    const { data } = props;

    // Set the y-axis to scale based on market cap data
    let minValue = Math.min(...data.map(price => price.price));
    let maxValue = Math.max(...data.map(price => price.price));
    
    return (
        <div className="ag-theme-quartz" style={{ height: 350, width: '100%' }}>
            <AgChartsReact options={{
                // Data: Data to be displayed in the chart
                data: data,
                // Series: Defines which chart type and data to use
                series: [{ type: 'line', xName:'Time', yName: 'Market Cap', xKey: 'time', yKey: 'price' }],
                title: {
                    text:  `Global Cryptocurrency Market Cap`
                },
                subtitle: {
                    text: "Last 30 Days"
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

export default HomePageMarketCapChart;