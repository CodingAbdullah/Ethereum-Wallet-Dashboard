import React, { useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid

const ERC720HoldingsInfoTable = (props) => {
    const { address, data } = props;

    // Column Definitions: Defines the columns to be displayed.
    const [columnDefs, setColumnDefs] = useState([]);
    
    let coinTableRowData = [];
    let item = {};

    // Transform row data and conform it to column name
    for (var i = 0; i < data.length; i++) {
        item = {
            name: data[i].name,
            tokenAddress: data[i].token_address,
            symbol: data[i].symbol,
            balance: data[i].balance
        }

        coinTableRowData.push(item);
        item = {};
    }

    // Function for handling column renders on window screen size
    const updateColumnDefs = () => {
        if (window.outerWidth < 550) {
            setColumnDefs([
                { field: "name", headerName: 'Name', flex: 1 },
                { field: "balance", headerName: "Balance", flex: 1 }
            ]);
        } 
        else if (window.outerWidth < 850) {
            setColumnDefs([
                { field: "name", headerName: 'Name', flex: 1 },
                { field: "symbol", headerName: "Symbol", flex: 1 },
                { field: "balance", headerName: "Balance", flex: 1 }            
            ]);
        }
        else {
            setColumnDefs([
                { field: "name", headerName: 'Name', flex: 1 },
                { field: "tokenAddress", headerName: 'Token Address', flex: 1 },
                { field: "symbol", headerName: "Symbol", flex: 1 },
                { field: "balance", headerName: "Balance", flex: 1 }
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
            <p><b>ERC20 Holdings</b><br /><i>List of individual tokens owned by wallet</i></p>
            <div className="ag-theme-quartz" style={{ marginLeft: 'auto', marginRight: 'auto', height: 200, width: '100%' }}>
                <AgGridReact
                    rowData={coinTableRowData}
                    columnDefs={columnDefs} />
            </div>
        </>
    )
}

export default ERC720HoldingsInfoTable;