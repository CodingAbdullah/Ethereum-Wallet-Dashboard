import React, { useState } from 'react';
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid

const ERC721CollectionExtraDataInfoTable = (props) => {
    const { data } = props; // Destructure the props object to get the data object

    // Setting rows to display extra data related to ERC721 Collection
    const [rowDefs, setRowDefs] = useState([
        { market: "Contract Address", data: data.contract_address, flex: 1 },
        { market: "Collection Image", data: data.image?.small, flex: 1} ,
        { market: "Market Cap", data: "$" + data.market_cap?.usd, flex: 1 },
        { market: "Market Cap 24 Hour % Change", data: data.market_cap_24h_percentage_change?.usd >= 0 ? '+' + Number(data.market_cap_24h_percentage_change?.usd).toFixed(2) + '%' : Number(data.market_cap_24h_percentage_change?.usd).toFixed(2) + '%', flex: 1 },
        { market: "Volume", data: "$" + data.volume_24h?.usd, flex: 1 },
        { market: "Volume 24 Hour % Change", data: data.volume_24h_percentage_change?.usd >= 0 ? '+' + Number(data.volume_24h_percentage_change?.usd).toFixed(2) + '%' : Number(data.volume_24h_percentage_change?.usd).toFixed(2) + '%', flex: 1 },
        { market: "Floor Price", data: "$" + data.floor_price?.usd, flex: 1 },
        { market: "Floor Price 24 Hour % Change", data: data.floor_price_24h_percentage_change?.usd >= 0 ? '+' + Number(data.floor_price_24h_percentage_change?.usd).toFixed(2) + '%' : Number(data.floor_price_24h_percentage_change?.usd).toFixed(2) + '%', flex: 1 },
        { market: "Floor Price 7 day % Change", data: data.floor_price_7d_percentage_change?.usd >= 0 ? '+' + Number(data.floor_price_7d_percentage_change?.usd).toFixed(2) + '%' : Number(data.floor_price_7d_percentage_change?.usd).toFixed(2) + '%', flex: 1 },
        { market: "Floor Price 14 day % Change", data: data.floor_price_14d_percentage_change?.usd >= 0 ? '+' + Number(data.floor_price_14d_percentage_change?.usd).toFixed(2) + '%' : Number(data.floor_price_14d_percentage_change?.usd).toFixed(2) + '%', flex: 1 },
        { market: "Floor Price 30 day % Change", data: data.floor_price_30d_percentage_change?.usd >= 0 ? '+' + Number(data.floor_price_30d_percentage_change?.usd).toFixed(2) + '%' : Number(data.floor_price_30d_percentage_change?.usd).toFixed(2) + '%', flex: 1 },
        { market: "Floor Price 60 day % Change", data: data.floor_price_60d_percentage_change?.usd >= 0 ? '+' + Number(data.floor_price_60d_percentage_change?.usd).toFixed(2) + '%' : Number(data.floor_price_60d_percentage_change?.usd).toFixed(2) + '%', flex: 1 },
        { market: "Number of Unique Addresses", data: data.number_of_unique_addresses, flex: 1 },
        { market: "Total Supply", data: data.total_supply, flex: 1 },
        { market: "One Day Sales", data: data.one_day_sales, flex: 1 },
        { market: "One Day Average Sale Price", data: data.one_day_average_sale_price, flex: 1 }
    ]);
            

    // Conditionally render row data based on data provided
    const [columnDefs, setColumnDefs] = useState([
        { field: "market", headerName: "Market", flex: 1 },
        { field: "data", headerName: "Data", flex: 1,
            cellRenderer: (params) => {
                if (String(params.value).charAt(0) === '+' || String(params.value).charAt(0) === '-') {
                    return String(params.value).charAt(0) === '+' ? <p style={{ color: 'green' }}><b>{params.value}</b></p> : <p style={{ color: 'red' }}><b>{params.value}</b></p>
                }
                else if (String(params.value).includes('https')) {
                    return <img src={params.value} alt="Collection Image" style={{ width: '35px', height: '40px' }} />
                }
                else {
                    return <p>{params.value}</p>
                }
            }
         },
    ]);

    // Render the ERC721 Collection Extra Data Info Table Price using the Ag-Grid React component
    return (        
        <>
            <hr style={{ marginTop: '3rem' }} />
            <p><b>ERC721 Collection Extra Information</b><br /><i>Latest market metrics related to collection</i></p>
            <div className="ag-theme-quartz" style={{ marginTop: '2rem', marginLeft: 'auto', marginRight: 'auto', height: 250, width: '100%' }}>
                <AgGridReact
                    rowData={rowDefs}
                    columnDefs={columnDefs} />
            </div>
        </>
    ) 
}

export default ERC721CollectionExtraDataInfoTable;