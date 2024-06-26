import React, { useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import Badge from '../Badge/Badge';
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid

const ERC721TransfersInfoTable = (props) => {
    const { data, address } = props;

    // Column Definitions: Defines the columns to be displayed.
    const [columnDefs, setColumnDefs] = useState([]);
    
    let coinTableRowData = [];
    let item = {};

    // Transform row data and conform it to column name
    for (var i = 0; i < data.length; i++) {
        item = {
            date: data[i].block_timestamp.split("T")[0],
            tokenAddress: data[i].token_address,
            id: data[i].token_id,
            from: data[i].from_address,
            to: data[i].to_address,
            direction: data[i].to_address === address ? "IN" : "OUT"
        }

        coinTableRowData.push(item);
        item = {};
    }

    // Function for handling column renders on window screen size
    const updateColumnDefs = () => {
        if (window.outerWidth < 1050) {
            setColumnDefs([
                { field: "id", headerName: 'ID', flex: 0.40 },
                { field: "from", headerName: "From", flex: 1 },
                { field: "to", headerName: "To", flex: 1 }
            ]);
        } 
        else if (window.outerWidth < 1200) {
            setColumnDefs([
                { field: "id", headerName: 'ID', flex: 0.40 },
                { field: 'tokenAddress', headerName: 'Token Address', flex: 1 },
                { field: "from", headerName: "From", flex: 1 },
                { field: "to", headerName: "To", flex: 1 }
            ]);
        } 
        else {
            setColumnDefs([
                { field: "date", headerName: 'Date', flex: 0.45 },
                { field: 'tokenAddress', headerName: 'Token Address', flex: 1 },
                { field: "id", headerName: 'ID', flex: 0.35 },
                { field: "from", headerName: "From", flex: 1 },
                { field: "to", headerName: "To", flex: 1 },
                { field: 'direction', headerName: 'Direction', flex: 0.45,
                    cellRenderer: function (params) {
                        if (params.data.to === address) {
                            return <Badge type="IN" />
                        }
                        else {
                            return <Badge type="OUT" />
                        }
                    }
                },
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
            <p><b>ERC721 Transfers</b><br /><i>{ address }</i></p>
            <div className="ag-theme-quartz" style={{ marginLeft: 'auto', marginRight: 'auto', height: 200, width: '100%' }}>
                <AgGridReact
                    rowData={coinTableRowData}
                    columnDefs={columnDefs} />
            </div>
        </>
    )
}

export default ERC721TransfersInfoTable;