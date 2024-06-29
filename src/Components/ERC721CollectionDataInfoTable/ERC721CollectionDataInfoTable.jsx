import React, { useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid

const ERC721CollectionDataInfoTable = (props) => {
    const { data } = props;

    let coinRowData = [];
    let item = {};

    // Transform row data and conform it to column name
    item = {
        tokenAddress: data.information.result[0].token_address,
        name: data.information.result[0].name,
        contractType: data.information.result[0].contract_type,
        symbol: data.information.result[0].symbol,
        verifiedCollection: data.information.result[0].verified_collection ? "YES" : "NO"
    }

    coinRowData.push(item);

    const [columnDefs, setColumnDefs] = useState([
        { field: "tokenAddress", headerName: "Token Address", flex: 1 },
        { field: "name", headerName: "Name", flex: 1 },
        { field: "contractType", headerName: "Contract Type", flex: 0.7 },
        { field: "symbol", headerName: "Symbol", flex: 0.5 },
        { field: "verifiedCollection", headerName: "Verified Collection", flex: 0.7 }
    ]);

    // Function for handling column renders on window screen size
    const updateColumnDefs = () => {
        if (window.outerWidth < 750) {
            setColumnDefs([
                { field: "name", headerName: 'Name', flex: 1 },
                { field: "symbol", headerName: "Symbol", flex: 0.5 },
                { field: "contractType", headerName: "Contract Type", flex: 0.7 }
            ]);
        } 
        else if (window.outerWidth < 1100) {
            setColumnDefs([
                { field: "name", headerName: 'Name', flex: 1 },
                { field: "symbol", headerName: "Symbol", flex: 0.5 },
                { field: "tokenAddress", headerName: "Token Address", flex: 1 },
                { field: "contractType", headerName: "Contract Type", flex: 0.7 }       
            ]);
        }
        else {
            setColumnDefs([
                { field: "name", headerName: 'Name', flex: 1 },
                { field: "symbol", headerName: "Symbol", flex: 0.5 },
                { field: "tokenAddress", headerName: "Token Address", flex: 1 },
                { field: "contractType", headerName: "Contract Type", flex: 0.7 },
                { field: "verifiedCollection", headerName: "Verified Collection", flex: 0.7 }
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
            <hr style={{ marginTop: '3rem' }} />
            <p><b>ERC721 Collection Data</b><br /><i>Data related to your requested collection</i></p>
            <div className="ag-theme-quartz" style={{ marginTop: '2rem', marginLeft: 'auto', marginRight: 'auto', height: 92.5, width: '100%' }}>
                <AgGridReact
                    rowData={coinRowData}
                    columnDefs={columnDefs} />
            </div>
        </>
    )
}

export default ERC721CollectionDataInfoTable;