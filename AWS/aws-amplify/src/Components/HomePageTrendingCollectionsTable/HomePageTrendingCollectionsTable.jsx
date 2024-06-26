import { useState, useEffect } from "react";
import numeral from 'numeral'; // Number formatting library
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid

const HomePageTrendingCollectionsTable = (props) => {
    const { collections } = props;

    let coinTableRowData = [];
    let item = {};

    // Adding a check to ensure page loads safely
    if (collections.length >= 5) {
        // Looping through collections structure and formatting data for display
        for (var i = 0; i < 5; i++) {
            item = {
                symbol: collections[i].symbol + " - " + collections[i].thumb,
                name: collections[i].name,
                floorPrice: collections[i].data.floor_price,
                percentChange: collections[i].data.floor_price_in_usd_24h_percentage_change >= 0 ? "+" + numeral(collections[i].data.floor_price_in_usd_24h_percentage_change).format('0.00') + '%' : numeral(collections[i].data.floor_price_in_usd_24h_percentage_change).format('0.00') + '%',
                volume: collections[i].data.h24_volume
            }
            
            coinTableRowData.push(item);
            item = {};
        }
    }
    
    const [rowData, updateRowData] = useState(coinTableRowData);

    // Column Definitions: Defines the columns to be displayed.
    const [columnDefs, setColumnDefs] = useState([]);
    
    // Function for handling column renders on window screen size
    const updateColumnDefs = () => {
        if (window.outerWidth < 550) {
            setColumnDefs([
                { field: "name", headerName: 'Name', flex: 1 },
                { field: "percentChange", headerName: "Price Change", flex: 1,
                    cellRenderer: (params) => {
                        return (
                            <p style={{ color: String(params.value).charAt(0) === '+' ? 'green' : 'red' }}><b>{params.value}</b></p>
                        )
                    }
                 }
            ]);
        } 
        else if (window.outerWidth < 1000) {
            setColumnDefs([
                { field: "name", headerName: 'Name', flex: 1 },
                { field: "symbol", headerName: "Symbol", flex: 1,
                    cellRenderer: (params) => {
                        return (
                            <p><img src={ params.value.split(" - ")[1] } alt="Thumbnail" style={{ width: '20px', height: '20px' }} />{" "}{ params.value.split(" - ")[0] }</p>
                        )
                    }
                 },
                { field: "percentChange", headerName: "Price Change", flex: 1,
                    cellRenderer: (params) => {
                        return (
                            <p style={{ color: String(params.value).charAt(0) === '+' ? 'green' : 'red' }}><b>{params.value}</b></p>
                        )
                    }
                 }
            ]);
        }
        else if (window.outerWidth < 1100) {
            setColumnDefs([
                { field: "name", headerName: 'Name', flex: 1 },
                { field: "symbol", headerName: "Symbol", flex: 1,
                    cellRenderer: (params) => {
                        return (
                            <p><img src={ params.value.split(" - ")[1] } alt="Thumbnail" style={{ width: '20px', height: '20px' }} />{" "}{ params.value.split(" - ")[0] }</p>
                        )
                    }
                 },
                { field: "percentChange", headerName: "Price Change", flex: 1,
                    cellRenderer: (params) => {
                        return (
                            <p style={{ color: String(params.value).charAt(0) === '+' ? 'green' : 'red' }}><b>{params.value}</b></p>
                        )
                    }
                 },
                { field: "floorPrice", headerName: "Floor Price", flex: 1 }
            ]);
        }
        else {
            setColumnDefs([
                { field: "name", headerName: 'Name', flex: 1 },
                { field: "symbol", headerName: "Symbol", flex: 1,
                    cellRenderer: (params) => {
                        return (
                            <p><img src={ params.value.split(" - ")[1] } alt="Thumbnail" style={{ width: '20px', height: '20px' }} />{" "}{ params.value.split(" - ")[0] }</p>
                        )
                    }
                 },
                { field: "floorPrice", headerName: "Floor Price", flex: 1 },
                { field: "percentChange", headerName: "Price Change", flex: 1,
                    cellRenderer: (params) => {
                        return (
                            <p style={{ color: String(params.value).charAt(0) === '+' ? 'green' : 'red' }}><b>{params.value}</b></p>
                        )
                    }
                 },
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
            rowData= {rowData}
          />
        </div>
      )
}

export default HomePageTrendingCollectionsTable;