import React, { useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid
import { useQuery } from '@tanstack/react-query';
import { erc721SalesPro } from '../../UtilFunctions/erc721SalesPRO';

const ERC721SalesLookupInfoTable = (props) => {
    const { address, tokenId } = props;

    // Incorporating React Query for efficient data fetching and query caching
    const erc721SalesQuery = useQuery({
        queryKey: ['erc721SalesInformation', address, tokenId],
        queryFn: erc721SalesPro
    });
        
    // Column Definitions: Defines the columns to be displayed.
    const [columnDefs, setColumnDefs] = useState([]);

    const updateColumnDefs = () => {    
        // Set default columns if no columns are provided in the query data
        if (window.outerWidth < 700){
            setColumnDefs([
                { field: "date", headerName: 'Date', flex: 1 },
                { field: "exchangeName", headerName: "Exchange Name", flex: 1 },
                { field: "ethValue", headerName: "ETH Value", flex: 1 },
            ]);
        }
        else if (window.outerWidth < 1100) {
            setColumnDefs([
                { field: "date", headerName: 'Date', flex: 1 },
                { field: "exchangeName", headerName: "Exchange Name", flex: 1 },
                { field: "ethValue", headerName: "ETH Value", flex: 1 },
                { field: "usdValue", headerName: "USD Value", flex: 1 },
            ]);
        }
        else {            
            setColumnDefs([
                { field: "date", headerName: 'Date', flex: 0.3 },
                { field: "exchangeName", headerName: "Exchange Name", flex: 0.5 },
                { field: "ethValue", headerName: "ETH Value", flex: 0.25 },
                { field: "usdValue", headerName: "USD Value", flex: 0.25 },
                { field: "buyer", headerName: "Buyer", flex: 1 },
                { field: "seller", headerName: "Seller", flex: 1 },
            ]);
        }
    }

    // Dynamically adjust table size depending on screen size
    useEffect(() => {
        updateColumnDefs();
        window.addEventListener('resize', updateColumnDefs);
        return () => window.removeEventListener('resize', updateColumnDefs);
    }, []);

    if (erc721SalesQuery.isLoading || erc721SalesQuery.isFetching){
        return <div>Loading...</div>
    }
    else if (erc721SalesQuery.isError){
        return <div>Error Fetching ERC721 Token Sales Information</div>
    }
    else {
        // Format table row information using data from the query
        let rowDataInformation = [];
        let item = {};

        // Formatting query data in order to display as rows in Ag-Grid table
        if (erc721SalesQuery.data && erc721SalesQuery.data.results) {
            let data = erc721SalesQuery.data.results;
            for (var i = 0; i < erc721SalesQuery.data.results.length; i++) {
                item = {
                    date: data[i].timestamp.split("T")[0],
                    exchangeName: data[i].exchange_name + '-' + data[i].contract_version,
                    ethValue: data[i].eth_price,
                    usdValue: "$" + data[i].usd_price.toFixed(2),
                    buyer: data[i].buyer,
                    seller: data[i].seller
                };

                rowDataInformation.push(item);
                item = {};
            }
        }
        
        // Rendering the Ag-Grid React component using the modified column and row data
        return (
            <>
                <hr style={{ marginTop: '3rem' }} />
                <p><b>ERC721 Sales Information</b><br /><i>Sales history of this token</i></p>
                <div className="ag-theme-quartz" style={{ marginLeft: 'auto', marginRight: 'auto', height: 200, width: '100%' }}>
                    <AgGridReact
                        rowData={rowDataInformation}
                        columnDefs={columnDefs} />
                </div>
            </>
        );
    }
}

export default ERC721SalesLookupInfoTable;