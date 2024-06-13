import { useEffect, useState } from "react";
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid

const ENSTransferByNameInfoTable = (props) => {
    const { data } = props;

    let coinTableRowData = [];
    let item = {};

    // Transform row data and conform it to column name
    for (var i = 0; i < data.information.results.length; i++) {
        item = {
            timeStamp: data.information.results[i].timestamp.split("T")[0],
            transactionHash: data.information.results[i].transaction_hash,
            category: data.information.results[i].category,
            from: data.information.results[i].from === null ? "null" : data.information.results[i].from,
            to: data.information.results[i].to === null ? "null" : data.information.results[i].to
        }

        coinTableRowData.push(item);
        item = {};
    }
    
    // Populate rowData with filtered information
    const [rowData, updateRowData] = useState(coinTableRowData);

    // Column Definitions: Defines the columns to be displayed.
    const [columnDefs, setColumnDefs] = useState([]);

    // Function for handling column renders on window screen size
    const updateColumnDefs = () => {
        if (window.outerWidth < 550) {
            setColumnDefs([
                { field: "timeStamp", headerName: 'Time Stamp', flex: 0.75 },
                { field: "from", headerName: "From", flex: 1 },
                { field: "to", headerName: "To", flex: 1 }    
            ]);
        } 
        else if (window.outerWidth < 1100) {
            setColumnDefs([
                { field: "timeStamp", headerName: 'Time Stamp', flex: 0.75 },
                { field: "category", headerName: "Category", flex: 0.5 },
                { field: "from", headerName: "From", flex: 1 },
                { field: "to", headerName: "To", flex: 1 }     
            ]);
        }
        else {
            setColumnDefs([
                { field: "timeStamp", headerName: 'Time Stamp', flex: 0.5 },
                { field: "transactionHash", headerName: 'Transaction Hash', flex: 1 },
                { field: "category", headerName: "Category", flex: 0.5 },
                { field: "from", headerName: "From", flex: 1 },
                { field: "to", headerName: "To", flex: 1 }     
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
            <p><b>ENS Transfer Information</b><br /><i>History of all domain transfers</i></p>
            <div className="ag-theme-quartz" style={{ marginLeft: 'auto', marginRight: 'auto', height: 200, width: '100%' }}>
                <AgGridReact
                    rowData={rowData}
                    columnDefs={columnDefs} />
            </div>
        </>
    )
}

export default ENSTransferByNameInfoTable;