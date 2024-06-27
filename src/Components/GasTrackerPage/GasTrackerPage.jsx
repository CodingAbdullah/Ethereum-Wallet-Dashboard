import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { metricsNavbarGasPrice } from '../../UtilFunctions/metricsNavbarGasPrice';
import { useNavigate } from 'react-router';
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import GasBlockInfoTable from '../GasBlockInfoTable/GasBlockInfoTable';
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid

const GasTrackerPage = () => {
    // Setting up query to fetch Ethereum gas price
    const gasPriceQuery = useQuery({
        queryKey: ['gas price'],
        queryFn: metricsNavbarGasPrice
    });

    const navigate = useNavigate();
    
    if (gasPriceQuery.isLoading){
        return <div role="main" class="p-3">Loading...</div>
    }
    else if (gasPriceQuery.isError){
        return <div role="main" class="p-3">Error fetching gas information</div>
    }
    else if (gasPriceQuery.isSuccess){ 
        // Using parent-child component hierarchy, pass down state information for display and leaner code
        let gas = gasPriceQuery.data[0].information;

        let rowData = [];
        
        // Inserting data to be represented as rows within the table
        rowData.push({ generalMetrics: 'System', data: gas.system.substring(0, 1).toUpperCase() + gas.system.substring(1) });
        rowData.push({ generalMetrics: 'Network', data: gas.network.substring(0, 1).toUpperCase() + gas.network.substring(1) });
        rowData.push({ generalMetrics: 'Unit', data: gas.unit.substring(0, 1).toUpperCase() + gas.unit.substring(1) });
        rowData.push({ generalMetrics: 'Max Price', data: gas.maxPrice + ' Gwei' });
        rowData.push({ generalMetrics: 'Current Block Number', data: gas.currentBlockNumber });
        rowData.push({ generalMetrics: 'MsSinceLastBlock', data: gas.msSinceLastBlock });

        let columnData = [
            { field: "generalMetrics", headerName: 'General Metrics', flex: 1 },
            { field: 'data', headerName: 'Data', flex: 1 } 
        ];

        // Rendering tables and child components containing Ethereum information
        return (
            <div className='gas-tracker-page'>
                <main role="main" class="p-3">
                    <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                        <h1 class="h2">Gas Information</h1>
                    </div>
                    <p><b>Ecosystem Overview</b><br /><i>High end look at the blockchain</i></p>
                    <div className="ag-theme-quartz" style={{ marginLeft: 'auto', marginRight: 'auto', height: 200, width: '100%' }}>
                        <AgGridReact
                            rowData={rowData}
                            columnDefs={columnData} />
                    </div>
                    <GasBlockInfoTable information={ gas.blockPrices[0].estimatedPrices }/>
                    <div>
                        <button style={{ marginTop: '3rem'}} onClick={ () => navigate("/") } class='btn btn-success'>Go To Dashboard</button>
                    </div>
                </main>
            </div>
        )
    }
}

export default GasTrackerPage;