import React from 'react';
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid

const ENSToAddressInfoTable = (props) => {

    const { data, address } = props;

    // AG Grid React rendering wallet ENS information
    return (
        <>
            <div className="ag-theme-quartz" style={{ marginLeft: 'auto', marginRight: 'auto', height: 92, width: '100%' }}>
                <AgGridReact
                    rowData={[
                        { address: data.information.results[0].owner, personalWebsite: "https://" + address + ".xyz/" }
                    ]}
                    columnDefs={[
                        { field: "address", headerName: 'Address', flex: 1 },
                        { field: "personalWebsite", headerName: "Personal website", flex: 1,
                            cellRenderer: (params) => {
                                return (
                                    <a style={{ color: 'black' }} target='_blank' href={ params.value }>Personal Wallet Site Link</a>
                                )
                            }
                         } 
                    ]} />
            </div>
        </>
    )
}

export default ENSToAddressInfoTable;