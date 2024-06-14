import React, { useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid

const ERC720TransfersInfoTable = (props) => {
    const { data, address } = props;

    // Column Definitions: Defines the columns to be displayed.
    const [columnDefs, setColumnDefs] = useState([]);
    
    let coinTableRowData = [];
    let item = {};

    // Transform row data and conform it to column name
    for (var i = 0; i < data.length; i++) {
        item = {
            date: data[i].block_timestamp.split("T")[0],
            from: data[i].from_address,
            to: data[i].to_address,
            balance: address !== null ? data[i].value : (data[i].value*(1/1000000000000000000))
        }

        coinTableRowData.push(item);
        item = {};
    }

    // Function for handling column renders on window screen size
    const updateColumnDefs = () => {
        if (window.outerWidth < 600) {
            setColumnDefs([
                { field: "from", headerName: 'From', flex: 1 },
                { field: "to", headerName: "To", flex: 1 },
                { field: "balance", headerName: "Balance", flex: 1 }
            ]);
        } 
        else {
            setColumnDefs([
                { field: "date", headerName: 'Date', flex: 1 },
                { field: "from", headerName: 'From', flex: 1 },
                { field: "to", headerName: "To", flex: 1 },
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
            <p><b>ERC20 Transfers</b><br /><i>{ address }</i></p>
            <div className="ag-theme-quartz" style={{ marginLeft: 'auto', marginRight: 'auto', height: 200, width: '100%' }}>
                <AgGridReact
                    rowData={coinTableRowData}
                    columnDefs={columnDefs} />
            </div>
        </>
    )
}

export default ERC720TransfersInfoTable;