import React, { useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid

const ERC721CollectionTransferInfoTable = (props) => {
    const { data } = props;

    let collectionRowData = [];
    let item = {};

    // Transform row data to be displayed in the ERC721 Collection Transfer Info Table
    for (var i = 0; i < data.length; i++) {
        item = {
            id: data[i].token_id,
            fromAddress: data[i].from_address,
            toAddress: data[i].to_address,
            timeStamp: String(data[i].block_timestamp).split("T")[0] 
                        + ' - ' 
                        + String(data[i].block_timestamp).split("T")[1].split(".")[0]
        }

        collectionRowData.push(item);
        item = {};
    }

    const [columnDefs, setColumnDefs] = useState([
        { field: "id", headerName: "Token ID", flex: 0.5 },
        { field: "fromAddress", headerName: "From", flex: 1 },
        { field: "toAddress", headerName: "To", flex: 1 },
        { field: "timeStamp", headerName: "Date", flex: 1 }
    ]);

    // Function for handling column renders on window screen size
    const updateColumnDefs = () => {
        if (window.outerWidth < 950) {
            setColumnDefs([
                { field: "id", headerName: "Token ID", flex: 0.5 },
                { field: "fromAddress", headerName: "From", flex: 1 },
                { field: "toAddress", headerName: "To", flex: 1 },
            ]);
        }
        else {
            setColumnDefs([
                { field: "id", headerName: "Token ID", flex: 0.5 },
                { field: "fromAddress", headerName: "From", flex: 1 },
                { field: "toAddress", headerName: "To", flex: 1 },
                { field: "timeStamp", headerName: "Date", flex: 1 }
            ]);
        }
    };

    // Dynamically adjust table size depending on screen size
    useEffect(() => {
        updateColumnDefs();
        window.addEventListener('resize', updateColumnDefs);
        return () => window.removeEventListener('resize', updateColumnDefs);
    }, []);

    // Posting sample data from the collection along with their token hashes
    return (
        <>
            <div className="ag-theme-quartz" style={{ marginTop: '2rem', marginLeft: 'auto', marginRight: 'auto', height: 250, width: '100%' }}>
                <AgGridReact
                    rowData={collectionRowData}
                    columnDefs={columnDefs} />
            </div>
        </>
    )
}

export default ERC721CollectionTransferInfoTable;