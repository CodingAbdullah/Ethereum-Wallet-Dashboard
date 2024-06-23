import { useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid

const PricesInfoTable = (props) => {
    const { coinData } = props;

    // Column Definitions: Defines the columns to be displayed.
    const [columnDefs, setColumnDefs] = useState([
        { field: "name", headerName: 'Opensea Account Information', flex: 0.5 },
        { field: "symbol", headerName: "Symbol", flex: 0.25 },
        { field: "currentPrice", headerName: "Price", flex: 1 },
        { field: "highPrice", headerName: "High Last 24 Hrs", flex: 1 },
        { field: "lowPrice", headerName: "Low Last 24 Hrs", flex: 1 },
        { field: "percentageChange24Hours", headerName: "24 Hr % Change", flex: 1 },
        { field: "marketCap", headerName: "Market Cap", flex: 1 },
        { field: "totalVolume", headerName: "Total Volume", flex: 1 }
    ]);

    let coinTableRowData = [];
    let item = {};

    // Loop through the coinData object to construct row data to be inserted into the prices table
    for (var i = 0; i < coinData.length; i++) {
        let item = { 
            name: coinData[i].name,
            symbol: String(coinData[i].symbol).toUpperCase(),
            currentPrice: "$" + String(Number(coinData[i].current_price).toFixed(2)) + " USD",
            highPrice: "$" + String(Number(coinData[i].high_24h).toFixed(2)) + " USD",
            lowPrice: "$" + String(Number(coinData[i].low_24h).toFixed(2)) + " USD",
            percentageChange24Hours: coinData[i].price_change_percentage_24h >= 0 ? "+" + String(Number(coinData[i].price_change_percentage_24h).toFixed(2)) + "%" : String(Number(coinData[i].price_change_percentage_24h).toFixed(2)) + "%",
            marketCap: "$" + String(Number(coinData[i].market_cap).toFixed(2)) + " USD",
            totalVolume: "$" + String(Number(coinData[i].total_volume).toFixed(2)) + " USD"
        };

        coinTableRowData.push(item);
        item = {};
    }

    // Function for handling column renders on window screen size
    const updateColumnDefs = () => {
        if (window.outerWidth < 750) {
            setColumnDefs([
                { field: "name", headerName: 'Name', flex: 0.75 },
                { field: "currentPrice", headerName: "Price", flex: 0.75 },
                { field: "marketCap", headerName: "Market Cap", flex: 1 }
            ]);
        } 
        else if (window.outerWidth < 950) {
            setColumnDefs([
                { field: "name", headerName: 'Name', flex: 0.5 },
                { field: "currentPrice", headerName: "Price", flex: 0.75 },
                { field: "percentageChange24Hours", headerName: "24 Hr % Change", flex: 1 },
                { field: "marketCap", headerName: "Market Cap", flex: 1 }
            ]);
        } 
        else if (window.outerWidth < 1200){
            setColumnDefs([
                { field: "name", headerName: 'Name', flex: 0.75 },
                { field: "symbol", headerName: 'Symbol', flex: 0.5 },
                { field: "currentPrice", headerName: "Price", flex: 0.65 },
                { field: "percentageChange24Hours", headerName: "24 Hr % Change", flex: 0.65 },
                { field: "marketCap", headerName: "Market Cap", flex: 0.85 },
                { field: "totalVolume", headerName: "Total Volume", flex: 0.85 }
            ]);
        }
        else {
            setColumnDefs([
                { field: "name", headerName: 'Name', flex: 0.75 },
                { field: "symbol", headerName: 'Symbol', flex: 0.5 },
                { field: "currentPrice", headerName: "Price", flex: 0.65 },
                { field: "highPrice", headerName: "High Last 24 Hrs", flex: 0.65 },
                { field: "lowPrice", headerName: "Low Last 24 Hrs", flex: 0.65 },
                { field: "percentageChange24Hours", headerName: "24 Hr % Change", flex: 0.65 },
                { field: "marketCap", headerName: "Market Cap", flex: 0.85 },
                { field: "totalVolume", headerName: "Total Volume", flex: 0.85 }
            ]);
        }
    };
    
    // Dynamically adjust table size depending on screen size
    useEffect(() => {
        updateColumnDefs();
        window.addEventListener('resize', updateColumnDefs);
        return () => window.removeEventListener('resize', updateColumnDefs);
    }, []);

    // Render Ag-Grid React component with row and column data
    // Display coin price data
    return (
        <>
            <p><i>View data of the <b>top 100</b> cryptocurrencies by market cap</i></p>
            <div className="ag-theme-quartz" style={{ marginTop: '1rem', marginLeft: 'auto', marginRight: 'auto', height: 400, width: '100%' }}>
                <AgGridReact
                    rowData={coinTableRowData}
                    columnDefs={columnDefs} />
            </div>
        </>
    )
}

export default PricesInfoTable;