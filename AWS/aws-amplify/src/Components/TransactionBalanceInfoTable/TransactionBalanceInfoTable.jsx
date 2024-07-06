import { useState } from 'react';
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid

const TransactionBalanceInfoTable = (props) => {
    const { data } = props;

    // Row Data: Defines the data to be displayed
    let rowDefs = [{
        ethBalance: data.chains[0].native_balance_formatted + " ETH",
        ethBalanceUSD: "$" + data.chains[0].native_balance_usd,
        tokenBalanceUSD: "$" + data.chains[0].token_balance_usd,
        totalUSDValue: "$" + data.total_networth_usd
    }]; 
    
    // Column Definitions: Defines the columns to be displayed
    const [columnDefs, setColumnDefs] = useState([
        { field: "ethBalance", headerName: 'ETH Balance', flex: 0.7 },
        { field: "ethBalanceUSD", headerName: "ETH USD Value", flex: 0.7 },
        { field: "tokenBalanceUSD", headerName: "Token USD Value", flex: 0.7 },
        { field: "totalUSDValue", headerName: "Wallet Value", flex: 0.7 }
    ]); 

    // Render Ag-Grid React component with row and column data
    return (
        <>
            <hr style={{ marginTop: '3rem' }} />
            <p><b>Wallet Balance Information</b><br /><i>Summary of token and ETH USD values</i></p>
            <div className="ag-theme-quartz" style={{ marginTop: '1rem', marginLeft: 'auto', marginRight: 'auto', height: 92.5, width: '100%' }}>
                <AgGridReact
                    rowData={rowDefs}
                    columnDefs={columnDefs} />
            </div>
        </>
    )
}

export default TransactionBalanceInfoTable;