import { useEffect, useState } from "react";
import { ensOwnershipPro } from '../../UtilFunctions/ensOwnershipPRO';
import { useQuery } from '@tanstack/react-query'; // React Query for data fetching
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid

const ENSOwnershipInfoTable = (props) => {
    const { address } = props;

    // React Query for fetching ENS information
    const ensOwnershipQuery = useQuery({
        queryKey: ['ens ownership', address],
        queryFn: ensOwnershipPro
    });

    const [columnDefs, setColumnDefs] = useState([]);

    const updateColumnDefs = () => {    
        // Set default columns if no columns are provided in the query data
        if (window.outerWidth < 600){
            setColumnDefs([
                { field: "ensName", headerName: 'ENS Name', flex: 1 },
                { field: "registrationDate", headerName: "Creation Date", flex: 1 },
                { field: "expirationDate", headerName: "Expiration Date", flex: 1 },
            ]);
        }
        else if (window.outerWidth < 900) {
            setColumnDefs([
                { field: "ensName", headerName: 'ENS Name', flex: 1 },
                { field: "registrationDate", headerName: "Creation Date", flex: 1 },
                { field: "expirationDate", headerName: "Expiration Date", flex: 1 },
                { field: "gracePeriodExpiration", headerName: "Grace Period", flex: 1 },
                { field: "premiumPeriodExpiration", headerName: "Premium Period", flex: 1 },
            ]);
        }
        else if (window.outerWidth < 1100) {            
            setColumnDefs([
                { field: "ensName", headerName: 'ENS Name', flex: 1 },
                { field: "registrationDate", headerName: "Creation Date", flex: 1 },
                { field: "expirationDate", headerName: "Expiration Date", flex: 1 },
                { field: "gracePeriodExpiration", headerName: "Grace Period", flex: 1 },
                { field: "premiumPeriodExpiration", headerName: "Premium Period", flex: 1 },
                { field: "inGracePeriod", headerName: "In Grace", flex: 1 },
                { field: "inPremiumPeriod", headerName: "In Premium", flex: 1 },
            ]);
        }
        else {
            setColumnDefs([
                { field: "ensName", headerName: 'ENS Name', flex: 1 },
                { field: "registrationDate", headerName: "Creation Date", flex: 1 },
                { field: "expirationDate", headerName: "Expiration Date", flex: 1 },
                { field: "gracePeriodExpiration", headerName: "Grace Period", flex: 1 },
                { field: "premiumPeriodExpiration", headerName: "Premium Period", flex: 1 },
                { field: "inGracePeriod", headerName: "In Grace", flex: 1 },
                { field: "inPremiumPeriod", headerName: "In Premium", flex: 1 },
                { field: "isExpired", headerName: "Expired", flex: 1 },
                { field: "lastRefreshed", headerName: "Last Refreshed", flex: 1 },
            ]);
        }
    }
    
    // Dynamically adjust table size depending on screen size
    useEffect(() => {
        updateColumnDefs();
        window.addEventListener('resize', updateColumnDefs);
        return () => window.removeEventListener('resize', updateColumnDefs);
    }, []);

    // Conditionally rendering component based on query status
    if (ensOwnershipQuery.isPending || ensOwnershipQuery.isLoading) {
        return <div role="main" class="p-3">Loading...</div>;
    } 
    else if (ensOwnershipQuery.isError || ensOwnershipQuery.isFailure) {
        return <div role="main" class="p-3">Error Loading ENS Ownership Data</div>;
    } 
    else {
        // Format table row information using data from the query
        let rowDataInformation = [];
        let item = {};

        // Formatting query data in order to display as rows in Ag-Grid table
        if (ensOwnershipQuery.data && ensOwnershipQuery.data.results) {
            for (var i = 0; i < ensOwnershipQuery.data.results.length; i++) {
                item = {
                    ensName: ensOwnershipQuery.data.results[i].ens_name,
                    registrationDate: ensOwnershipQuery.data.results[i].registration_timestamp.split("T")[0],
                    expirationDate: ensOwnershipQuery.data.results[i].expiration_timestamp.split("T")[0],
                    gracePeriodExpiration: ensOwnershipQuery.data.results[i].grace_period_ends.split("T")[0],
                    premiumPeriodExpiration: ensOwnershipQuery.data.results[i].premium_period_ends.split("T")[0],
                    inGracePeriod: ensOwnershipQuery.data.results[i].in_grace_period === false ? "No" : "Yes",
                    inPremiumPeriod: ensOwnershipQuery.data.results[i].in_premium_period === false ? "No" : "Yes",
                    isExpired: ensOwnershipQuery.data.results[i].is_expired === false ? "No" : "Yes",
                    lastRefreshed: ensOwnershipQuery.data.results[i].last_refreshed.split("T")[0]
                };

                rowDataInformation.push(item);
                item = {};
            }
        }

        // Rendering the Ag-Grid React component using the modified column and row data
        return (
            <>
                <p><b>ENS Ownership</b><br /><i>ENS names that you own</i></p>
                <div className="ag-theme-quartz" style={{ marginLeft: 'auto', marginRight: 'auto', height: 200, width: '100%' }}>
                    <AgGridReact
                        rowData={rowDataInformation}
                        columnDefs={columnDefs} />
                </div>
            </>
        );
    }
};

export default ENSOwnershipInfoTable;
