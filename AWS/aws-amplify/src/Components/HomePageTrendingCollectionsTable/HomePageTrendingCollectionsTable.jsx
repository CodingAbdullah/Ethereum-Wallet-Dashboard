import { useState } from "react";
import numeral from 'numeral'; // Number formatting library
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid

const HomePageTrendingCollectionsTable = (props) => {
    const { collections } = props;

    let coinTableRowData = [];
    let item = {};

    // Looping through collections structure and formatting data for display
    for (var i = 0; i < 5; i++) {
        item = {
            symbol: collections[i].symbol,
            name: collections[i].name,
            floorPrice: collections[i].data.floor_price,
            percentChange: numeral(collections[i].data.floor_price_in_usd_24h_percentage_change).format('0.00') + '%',
            volume: collections[i].data.h24_volume
        }
        coinTableRowData.push(item);
        item = {};
    }
    
    const [rowData, updateRowData] = useState(coinTableRowData);

    // Column Definitions: Defines the columns to be displayed.
    const [colDefs, setColDefs] = useState([
        { field: "name", headerName: 'Name' },
        { field: "symbol", headerName: "Symbol" },
        { field: "floorPrice", headerName: "Floor Price" },
        { field: "percentChange", headerName: "Price Change" },
        { field: "volume", headerName: "Volume" }    
    ]);

    // Passing in data to be rendered as a table using the AgGridReact component
    return (
        <div className="ag-theme-quartz" style={{ marginLeft: 'auto', marginRight: 'auto', marginBottom: '1rem', height: 280, width: 1020 }}>
            <AgGridReact
                rowData={rowData}
                columnDefs={colDefs} />
        </div>
    )
}

export default HomePageTrendingCollectionsTable