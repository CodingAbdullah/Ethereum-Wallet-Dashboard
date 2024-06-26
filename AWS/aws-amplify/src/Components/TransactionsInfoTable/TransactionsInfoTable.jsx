import { useEffect, useState, useRef } from 'react';
import Badge from '../Badge/Badge';
import numeral from 'numeral'; // Number formatting library
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid

const TransactionsInfoTable = (props) => {
    const { data, walletAddress, isMatic, networkFetch } = props; // Retrieving data from transactions page
    
    let coinTableRowData = [];
    let item = {};

    // Working through the data and formatting it to be displayed in the table
    for (var i = 0; i < data.length; i++) {
        item = {
            blockNumber: networkFetch ? data[i].block_number : data[i].blockNumber,
            timeStamp: networkFetch ? data[i].block_timestamp.split(".")[0] : new Date(data[i].timeStamp*1000).toString().split("GMT")[0].trim() +"-EST",
            from: networkFetch ? data[i].from_address : data[i].from,
            to: networkFetch ? data[i].to_address : data[i].to,
            direction: networkFetch ? ( walletAddress.toLowerCase() === data[i].to_address ? "IN" : "OUT" ) : ( walletAddress.toLowerCase() === data[i].to ? "IN" : "OUT" ),
            value: isMatic ? (data[i].value*(1/1000000000000000000)).toPrecision(4) + " MATIC" : (data[i].value*(1/1000000000000000000)).toPrecision(4) + " ETH"
        }
        coinTableRowData.push(item);
        item = {};
    }

    const [rowData, updateRowData] = useState(coinTableRowData);

    // Column Definitions: Defines the columns to be displayed.
    const [columnDefs, setColumnDefs] = useState([]);

    const gridRef = useRef(null);
        
    // Function for handling column renders on window screen size
    const updateColumnDefs = () => {
        if (window.outerWidth < 1000) {
            setColumnDefs([
                { field: "from", headerName: "From", flex: 1 },
                { field: "to", headerName: "To", flex: 1 },  
                { field: "value", headerName: "Value", flex: 1 } 
            ]);
        } 
        else if (window.outerWidth < 1250) {
            setColumnDefs([
                { field: "timeStamp", headerName: 'Time Stamp', flex: 1 },
                { field: "from", headerName: "From", flex: 1 },
                { field: "to", headerName: "To", flex: 1 },
                { field: "value", headerName: "Value", flex: 1 }    
            ]);
        }
        else {
            setColumnDefs([
                { field: "timeStamp", headerName: 'Time Stamp', flex: 0.75 },
                { field: "from", headerName: "From", flex: 1 },
                { field: "to", headerName: "To", flex: 1 },
                { field: 'direction', headerName: 'Direction', flex: 0.45,
                    cellRenderer: function (params) {
                        if (params.data.direction === "IN") {
                            return <Badge type="IN" />
                        }
                        else {
                            return <Badge type="OUT" />
                        }
                    }
                },  
                { field: "value", headerName: "Value", flex: 0.55 }
            ]);
        }
      };
    
      // Dynamically adjust table size depending on screen size
      useEffect(() => {
        updateColumnDefs();
        window.addEventListener('resize', updateColumnDefs);
        return () => window.removeEventListener('resize', updateColumnDefs);
      }, []);

      // Fitting all columns on screen size
      useEffect(() => {
        if (gridRef.current && rowData.length > 0) {
            const gridApi = gridRef.current.api;
            gridApi.sizeColumnsToFit();
        }
    }, [rowData]);

    return (
        <>
            <p><b>Activity</b><br /><i>1000 Most Recent Transactions</i></p>
            <div className="ag-theme-quartz" style={{ marginLeft: 'auto', marginRight: 'auto', height: 400, width: '100%' }}>
                <AgGridReact
                    rowData={rowData}
                    columnDefs={columnDefs}
                    gridRef={gridRef} />
            </div>
        </>
    )
}

export default TransactionsInfoTable;