import React, { useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid

const ERC720CollectionOwnersInfoTable = (props) => {
    const { data } = props;
   
    let tokenRowData = [];
    let item = {};

    // Formatting row data to be displayed in the ERC20 Collection Transfers Info Table
    for (var i = 0; i < data.length; i++) {
        item = {
            ownerAddress: data[i].owner_address,
            balance: data[i].balance_formatted,
            usdValue: "$" + Number(data[i].usd_value).toFixed(2),
            value: data[i].percentage_relative_to_total_supply + "%"
        }

        tokenRowData.push(item);
        item = {};
    }   
    
    // Setting column definitions for the ERC20 Collection Transfers Info Table
    const [columnDefs, setColumnDefs] = useState([
        { field: "ownerAddress", headerName: 'Owner', flex: 1 },
        { field: "balance", headerName: 'Token Balance', flex: 1 },
        { field: "usdValue", headerName: 'USD Value', flex: 1 },
        { field: "value", headerName: 'Percentage of Supply', flex: 1 }
    ]);    
    
    // Function for handling column renders on window screen size
    const updateColumnDefs = () => {
        if (window.outerWidth < 700) {
            setColumnDefs([
                { field: "ownerAddress", headerName: 'Owner', flex: 1 },
                { field: "balance", headerName: 'Token Balance', flex: 1 },
                { field: "usdValue", headerName: 'USD Value', flex: 1 }
            ]);
        }
        else {
            setColumnDefs([
                { field: "ownerAddress", headerName: 'Owner', flex: 1 },
                { field: "balance", headerName: 'Token Balance', flex: 1 },
                { field: "usdValue", headerName: 'USD Value', flex: 1 },
                { field: "value", headerName: 'Percentage of Supply', flex: 1 }
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
            <p><b>ERC20 Token Owners</b><br /><i>Owners of this ERC20 token</i></p>
            <div className="ag-theme-quartz" style={{ marginLeft: 'auto', marginRight: 'auto', height: 200, width: '100%' }}>
                <AgGridReact
                    rowData={tokenRowData}
                    columnDefs={columnDefs} />
            </div>
        </>
    )
}

export default ERC720CollectionOwnersInfoTable;