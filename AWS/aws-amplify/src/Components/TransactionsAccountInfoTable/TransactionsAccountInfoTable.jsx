import { useEffect, useState } from "react";
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid

const TransactionsAccountInfoTable = (props) =>  {
    const { walletAddress, walletBalance, ethPrice } = props;
    
    // Calculating values for Account Info Table
    const [rowData, updateRowData] = useState([
        {   account: walletAddress, 
            ethPrice: "$" + ethPrice.ethereum.usd.toFixed(2), 
            ethBalance: walletBalance.result*(1/1000000000000000000) + " ETH", 
            valueInUSD: "$" + walletBalance.result*(1/1000000000000000000) * ethPrice.ethereum.usd + " USD" 
        }
    ]);

    // Column Definitions: Defines the columns to be displayed.
    const [columnDefs, setColumnDefs] = useState([]);

    // Function for handling column renders on window screen size
    const updateColumnDefs = () => {
        if (window.outerWidth < 550) {
            setColumnDefs([
                { field: "ethBalance", headerName: "ETH Balance", flex: 1 },   
                { field: "valueInUSD", headerName: "USD Value", flex: 1 }    
            ]);
        } 
        else {
            setColumnDefs([
                { field: "ethPrice", headerName: "ETH Price", flex: 1 },
                { field: "ethBalance", headerName: "ETH Balance", flex: 1 },   
                { field: "valueInUSD", headerName: "USD Value", flex: 1 }
            ]);
        }
      };
    
    // Dynamically adjust table size depending on screen size
    useEffect(() => {
        updateColumnDefs();
        window.addEventListener('resize', updateColumnDefs);
        return () => window.removeEventListener('resize', updateColumnDefs);
    }, []);

    // Return AG Grid React Component containing account information
    return (
        <>
            <p><b>Address: { walletAddress }</b></p>
            <div className="ag-theme-quartz" style={{ marginLeft: 'auto', marginRight: 'auto', width: '50%', height: '5.75rem', width: '100%' }}>
                <AgGridReact
                    rowData={rowData}
                    columnDefs={columnDefs} />
            </div>
        </>
    )
}

export default TransactionsAccountInfoTable;