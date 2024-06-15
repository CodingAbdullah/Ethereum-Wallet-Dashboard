import React, { useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid

const ERC721HoldingsInfoTable = (props) => {
    const { address, data } = props; // Destructure data

    // Column Definitions: Defines the columns to be displayed.
    const [columnDefs, setColumnDefs] = useState([]);
    
    let coinTableRowData = [];
    let item = {};

    // Transform row data and conform it to column name
    for (var i = 0; i < data.result.length; i++) {
        item = {
            name: data.result[i].name,
            tokenAddress: data.result[i].token_address,
            link: "opensea.io/assets/ethereum/" + data.result[i].token_address + "/" + data.result[i].token_id
        }

        coinTableRowData.push(item);
        item = {};
    }

    // Function for handling column renders on window screen size
    const updateColumnDefs = () => {
        if (window.outerWidth < 750) {
            setColumnDefs([
                { field: "name", headerName: 'Name', flex: 1 },
                { field: "link", headerName: "Link", flex: 1 }
            ]);
        } 
        else {
            setColumnDefs([
                { field: "name", headerName: 'Name', flex: 1 },
                { field: "tokenAddress", headerName: "Token Address", flex: 1 },
                { field: "link", headerName: "Link", flex: 1 }
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
    return (
        <>
            <hr style={{ marginTop: '3rem' }} />
            <p><b>ERC721 Holdings</b><br /><i>{ address }</i></p>
            <div className="ag-theme-quartz" style={{ marginLeft: 'auto', marginRight: 'auto', height: 200, width: '100%' }}>
                <AgGridReact
                    rowData={coinTableRowData}
                    columnDefs={columnDefs} />
            </div>
        </>
    )
}

export default ERC721HoldingsInfoTable;