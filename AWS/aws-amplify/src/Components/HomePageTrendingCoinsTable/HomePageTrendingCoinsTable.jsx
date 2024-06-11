import { useState } from "react";
import numeral from 'numeral'; // Number formatting library
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid

const HomePageTrendingCoinsTable = (props) => {
    const { coins } = props;

    let coinTableRowData = [];
    let item = {};

    for (var i = 0; i < 5; i++) {
        item = {
            rank: coins[i].item.market_cap_rank,
            name: coins[i].item.name,
            symbol: coins[i].item.symbol,
            marketCap: coins[i].item.data.market_cap,
            priceChange: numeral(coins[i].item.data.price_change_percentage_24h.usd).format('0.00') + '%'
        }
        coinTableRowData.push(item);
        item = {};
    }
    
    const [rowData, updateRowData] = useState(coinTableRowData);

    // Column Definitions: Defines the columns to be displayed.
    const [colDefs, setColDefs] = useState([
        { field: "name", headerName: 'Name' },
        { field: "symbol", headerName: "Symbol" },
        { field: "rank", headerName: "Market Cap Rank" },
        { field: "marketCap", headerName: "Market Cap" },
        { field: "priceChange", headerName: "Price Change" }    
    ]);

    return (
        <div className="ag-theme-quartz" style={{ marginLeft: 'auto', marginRight: 'auto', height: 280, width: 1020 }}>
            <AgGridReact
                rowData={rowData}
                columnDefs={colDefs} />
        </div>
    )
}

export default HomePageTrendingCoinsTable