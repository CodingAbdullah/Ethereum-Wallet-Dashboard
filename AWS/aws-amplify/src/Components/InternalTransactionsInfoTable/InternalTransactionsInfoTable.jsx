import { useEffect, useState, useRef } from 'react';
import Badge from '../Badge/Badge';
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid

const InternalTransactionsInfoTable = (props) => {
    const { data, walletAddress } = props;

    let coinTableRowData = [];
    let item = {};

    // Working through the data and formatting it to be displayed in the table
    for (var i = 0; i < data.length; i++) {
        item = {
            blockNumber: data[i].blockNumber,
            timeStamp: new Date(data[i].timeStamp*1000).toString().split("GMT")[0].trim() +"-EST",
            from: data[i].from,
            to: data[i].to,
            direction: data[i].to === walletAddress ? "IN" : "OUT",
            value: data[i].value*(1/1000000000000000000).toPrecision(4) + " ETH"
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
                { field: "timeStamp", headerName: 'Time Stamp', flex: 1 },
                { field: "from", headerName: "From", flex: 1 },
                { field: "to", headerName: "To", flex: 1 },
                { field: 'direction', headerName: 'Direction', flex: 0.45,
                    cellRenderer: function (params) {
                        if (params.data.to === walletAddress) {
                            return <Badge type="IN" />
                        }
                        else {
                            return <Badge type="OUT" />
                        }
                    }
                }, 
                { field: "value", headerName: "Value", flex: 1 }
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

    // Render AG Grid Table containing all the internal transactions
    return (
        <>
            <p><b>Internal Transactions</b><br /><i>Recent Internal Activity</i></p>
            <div className="ag-theme-quartz" style={{ marginLeft: 'auto', marginRight: 'auto', height: 250, width: '100%' }}>
                <AgGridReact
                    rowData={rowData}
                    columnDefs={columnDefs}
                    gridRef={gridRef} />
            </div>
        </>
    )
}

export default InternalTransactionsInfoTable;