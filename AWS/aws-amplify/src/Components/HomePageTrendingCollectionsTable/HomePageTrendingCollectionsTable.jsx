import { useState, useEffect } from "react";
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
    const [columnDefs, setColumnDefs] = useState([]);
    
    // Function for handling column renders on window screen size
    const updateColumnDefs = () => {
        if (window.outerWidth < 550) {
            setColumnDefs([
                { field: "name", headerName: 'Name', flex: 1 },
                { field: "percentChange", headerName: "Price Change", flex: 1 }
            ]);
        } 
        else if (window.outerWidth < 1000) {
            setColumnDefs([
                { field: "name", headerName: 'Name', flex: 1 },
                { field: "symbol", headerName: "Symbol", flex: 1 },
                { field: "percentChange", headerName: "Price Change", flex: 1 }
            ]);
        }
        else if (window.outerWidth < 1100) {
            setColumnDefs([
                { field: "name", headerName: 'Name', flex: 1 },
                { field: "symbol", headerName: "Symbol", flex: 1 },
                { field: "percentChange", headerName: "Price Change", flex: 1 },
                { field: "floorPrice", headerName: "Floor Price", flex: 1 }
            ]);
        }
        else {
            setColumnDefs([
                { field: "name", headerName: 'Name', flex: 1 },
                { field: "symbol", headerName: "Symbol", flex: 1 },
                { field: "floorPrice", headerName: "Floor Price", flex: 1 },
                { field: "percentChange", headerName: "Price Change", flex: 1 },
                { field: "volume", headerName: "Volume", flex: 1 } 
            ]);
        }
      };
    
      // Dynamically adjust table size depending on screen size
      useEffect(() => {
        updateColumnDefs();
        window.addEventListener('resize', updateColumnDefs);
        return () => window.removeEventListener('resize', updateColumnDefs);
      }, []);
    
      // Render AG Grid Table Component
      return (
        <div className="ag-theme-quartz" style={{ marginTop: '1rem', marginLeft: 'auto', marginRight: 'auto', height: 260, width: '100%' }}>
          <AgGridReact
            columnDefs={columnDefs}
            rowData= {rowData }
          />
        </div>
      )
}

export default HomePageTrendingCollectionsTable;