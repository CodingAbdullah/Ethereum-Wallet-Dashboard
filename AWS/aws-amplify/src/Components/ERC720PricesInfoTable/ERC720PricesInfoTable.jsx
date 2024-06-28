import React, { useState } from 'react';
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid

const ERC20PricesInfoTable = (props) => {
    const { coinInformation } = props; // Destructure data

    // Column Definitions: Defines the columns to be displayed
    // Adding color features to data related to percent changes in price
    const [columnDefs, setColumnDefs] = useState([
      { field: "tokenInformation", headerName: 'Token Information', flex: 1 },
      { field: "data", headerName: "Data", flex: 1,
        cellRenderer: (params) => {
          if (String(params.value).charAt(0) === '+' || String(params.value).charAt(0) === '-') {
              return String(params.value).charAt(0) === '+' ? <p style={{ color: 'green' }}><b>{params.value}</b></p> : <p style={{ color: 'red' }}><b>{params.value}</b></p>
          }
          else {
              return <p>{params.value}</p>
          }
        }
       }
    ]);    
    
    const [rowDefs, setRowDefs] = useState([
      { tokenInformation: "Symbol", data: coinInformation.symbol },
      { tokenInformation: "Last Updated", data: coinInformation.last_updated.split('T')[0] },
      { tokenInformation: "Home Page", data: coinInformation.links.homepage[0] },
      { tokenInformation: "Chat Apps", data: coinInformation.links.chat_url[0] },
      { tokenInformation: "Twitter Handle", data: coinInformation.links.twitter_screen_name },
      { tokenInformation: "Total Supply", data: coinInformation.market_data.total_supply },
      { tokenInformation: "Max Supply", data: coinInformation.market_data.max_supply },
      { tokenInformation: "Circulating Supply", data: coinInformation.market_data.circulating_supply },
      { tokenInformation: "24-Hr % Change", data: coinInformation.market_data.price_change_percentage_24h >= 0 ? "+" + coinInformation.market_data.price_change_percentage_24h.toFixed(2) + "%" : coinInformation.market_data.price_change_percentage_24h.toFixed(2) + "%" },
      { tokenInformation: "Highest 24-Hr Price", data: "$" + coinInformation.market_data.high_24h.usd },
      { tokenInformation: "Lowest 24-Hr Price", data: "$" + coinInformation.market_data.low_24h.usd },
      { tokenInformation: "Total Volume", data: "$" + coinInformation.market_data.total_volume.usd },
      { tokenInformation: "All-Time Low", data: "$" + coinInformation.market_data.atl.usd },
      { tokenInformation: "All-Time Low Date", data: coinInformation.market_data.atl_date.usd.split("T")[0] },
      { tokenInformation: "All-Time High", data: "$" + coinInformation.market_data.ath.usd },
      { tokenInformation: "All-Time High Date", data: coinInformation.market_data.ath_date.usd.split("T")[0] },
      { tokenInformation: "All-Time Highest Price to Current % Change", data: coinInformation.market_data.ath_change_percentage.usd >= 0 ? "+" + coinInformation.market_data.ath_change_percentage.usd.toFixed(2) + "%" : coinInformation.market_data.ath_change_percentage.usd.toFixed(2) + "%" }
    ]);
    
    // Render Ag-Grid React component with row and column data
    // Display data of the valid ERC20 token
    return (
        <>
            <div className="ag-theme-quartz" style={{ marginTop: '2rem', marginLeft: 'auto', marginRight: 'auto', height: 400, width: '100%' }}>
                <AgGridReact
                    rowData={rowDefs}
                    columnDefs={columnDefs} />
            </div>
        </>
    )
}

export default ERC20PricesInfoTable;