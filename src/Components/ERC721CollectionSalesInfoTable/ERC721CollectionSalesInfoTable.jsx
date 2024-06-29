import React, { useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid

const ERC721CollectionSalesInfoTable = (props) => {
    const { data } = props;

    let salesRowData = [];
    let item = {};

    // Transform row data to be displayed in the ERC721 Collection Sales Info Table
    for (var i = 0; i < data.length; i++) {
        
        let ids = ''; // Data manipulation for display
        if (data[i].token_ids.length > 1){
            for (var i = 0 ; i < data[i].token_ids.length; i++){
                ids += data[i].token_ids + ", ";
            }

            ids = ids.substring(0, ids.length - 2); // Remove the delimiter and space at the end
        }
        else {
            ids = data[i].token_ids; // Else, keep ID as is
        }

        item = {
            buyer: data[i].buyer_address,
            seller: data[i].seller_address,
            ids,
            price: Number(data[i].price*(1/1000000000000000000)).toPrecision(4) + " ETH",
            time: String(data[i].block_timestamp.split("T")[0]) + ' - ' + String(data[i].block_timestamp.split("T")[1]).split(".")[0]
        }

        salesRowData.push(item);
        item = {};
    }

    // Defining columns to be added to the ERC721 Collection Sales Info Table
    const [columnDefs, setColumnDefs] = useState([
        { field: "buyer", headerName: "Buyer", flex: 0.5 },
        { field: "seller", headerName: "Seller", flex: 1 },
        { field: "ids", headerName: "Token ID", flex: 1 },
        { field: "price", headerName: "Price", flex: 1 },
        { field: "time", headerName: "Time", flex: 1 }
    ]);

    // Function for handling column renders on window screen size
    const updateColumnDefs = () => {
        if (window.outerWidth < 900) {
            setColumnDefs([
                { field: "ids", headerName: "Token ID", flex: 0.5 },
                { field: "price", headerName: "Price", flex: 1 },
                { field: "time", headerName: "Time", flex: 1 },
            ]);
        }
        else {
            setColumnDefs([
                { field: "ids", headerName: "Token ID", flex: 0.5 },
                { field: "buyer", headerName: "Buyer", flex: 1 },
                { field: "seller", headerName: "Seller", flex: 1 },
                { field: "price", headerName: "Price", flex: 1 },
                { field: "time", headerName: "Time", flex: 1 }
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
            <div className="ag-theme-quartz" style={{ marginTop: '1rem', marginLeft: 'auto', marginRight: 'auto', height: 150, width: '100%' }}>
                <AgGridReact
                    rowData={salesRowData}
                    columnDefs={columnDefs} />
            </div>
        </>
    )
}

export default ERC721CollectionSalesInfoTable;