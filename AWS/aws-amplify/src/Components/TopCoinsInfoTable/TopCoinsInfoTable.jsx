import { useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid

const TopCoinsInfoTable = (props) => {
    const { topCoins } = props;

    let coinTableRowData = [];
    let item = {};

    // Column Definitions: Defines the columns to be displayed.
    const [columnDefs, setColumnDefs] = useState([
        { field: "name", headerName: 'Name', flex: 1 },
        { field: "symbol", headerName: "Symbol", flex: 1 },
        { field: "currentPrice", headerName: "Price", flex: 1 },
        { field: "percentageChange24Hours", headerName: "24 Hr % Change", flex: 1 },
    ]);

    // Fetch the top five gaining coins
    for (var i = 0; i < 5; i++) {
        item = {
            name: topCoins[i].name,
            symbol: String(topCoins[i].symbol).toUpperCase(),
            currentPrice: "$" + topCoins[i].usd + " USD",
            percentageChange24Hours: topCoins[i].usd_24h_change >= 0 ? "+" + topCoins[i].usd_24h_change.toFixed(2) + "%" : topCoins[i].usd_24h_change.toFixed(2) + "%"
        }

        coinTableRowData.push(item);
        item = {};
    }

    // Render Ag-Grid React component with row and column data
    // Display coin price data
    return (
        <>
            <p><i><b>Top winning</b> coins</i></p>
            <div className="ag-theme-quartz" style={{ marginTop: '1rem', marginLeft: 'auto', marginRight: 'auto', height: 260, width: '100%' }}>
                <AgGridReact
                    rowData={coinTableRowData}
                    columnDefs={columnDefs} />
            </div>
        </>
    )
}

export default TopCoinsInfoTable;