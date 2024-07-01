import React, { useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid

const ERC720CollectionTransfersInfoTable = (props) => {
    const { data } = props;
   
    let tokenRowData = [];
    let item = {};

    // Formatting row data to be displayed in the ERC20 Collection Transfers Info Table
    for (var i = 0; i < data.length; i++) {
        item = {
            txnHash: data[i].transaction_hash,
            timeStamp: data[i].block_timestamp.split("T")[0] + ' - ' + data[i].block_timestamp.split("T")[1].split(".")[0],
            fromAddress: data[i].from_address,
            toAddress: data[i].to_address,
            value: data[i].value
        }

        tokenRowData.push(item);
        item = {};
    }   
    
    // Setting column definitions for the ERC20 Collection Transfers Info Table
    const [columnDefs, setColumnDefs] = useState([
        { field: "txnHash", headerName: 'Txn Hash', flex: 1 },
        { field: "timeStamp", headerName: 'Date', flex: 1 },
        { field: "fromAddress", headerName: 'From', flex: 1 },
        { field: "toAddress", headerName: 'To', flex: 1 },
        { field: "value", headerName: 'Value', flex: 1 }
    ]);    
    
    // Function for handling column renders on window screen size
    const updateColumnDefs = () => {
        if (window.outerWidth < 700) {
            setColumnDefs([
                { field: "fromAddress", headerName: 'From', flex: 1 },
                { field: "toAddress", headerName: 'To', flex: 1 },
                { field: "value", headerName: 'Value', flex: 1 }
            ]);
        }
        else if (window.outerWidth < 900) {
            setColumnDefs([
                { field: "timeStamp", headerName: 'Date', flex: 1 },
                { field: "fromAddress", headerName: 'From', flex: 1 },
                { field: "toAddress", headerName: 'To', flex: 1 },
                { field: "value", headerName: 'Value', flex: 1 }
            ]);
        }
        else {
            setColumnDefs([
                { field: "timeStamp", headerName: 'Date', flex: 1 },
                { field: "txnHash", headerName: 'Txn Hash', flex: 1 },
                { field: "fromAddress", headerName: 'From', flex: 1 },
                { field: "toAddress", headerName: 'To', flex: 1 },
                { field: "value", headerName: 'Value', flex: 1 }
            ]);
        }
    };

    // Dynamically adjust table size depending on screen size
    useEffect(() => {
        updateColumnDefs();
        window.addEventListener('resize', updateColumnDefs);
        return () => window.removeEventListener('resize', updateColumnDefs);
    }, []);

    return (
        <>
            <hr style={{ marginTop: '3rem' }} />
            <p><b>ERC20 Token Transfers</b><br /><i>Recent transfer activity of this ERC20 token</i></p>
            <div className="ag-theme-quartz" style={{ marginLeft: 'auto', marginRight: 'auto', height: 200, width: '100%' }}>
                <AgGridReact
                    rowData={tokenRowData}
                    columnDefs={columnDefs} />
            </div>
        </>
    )
}

export default ERC720CollectionTransfersInfoTable;