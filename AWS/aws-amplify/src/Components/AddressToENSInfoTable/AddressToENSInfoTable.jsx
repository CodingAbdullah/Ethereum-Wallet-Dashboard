import { useEffect, useState } from "react";
import numeral from 'numeral'; // Number formatting library
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid

const AddressToENSInfoTable = (props) => {
    const { data, walletAddress } = props;

    // AG Grid React rendering wallet ENS information
    return (
        <>
            <p><b>Address:</b><br /><i>{ walletAddress }</i></p>
            <div className="ag-theme-quartz" style={{ marginLeft: 'auto', marginRight: 'auto', width: '50%', height: 92, width: '100%' }}>
                <AgGridReact
                    rowData={[
                        { ensResolver: data.name, personalWebsite: "https://" + data.name + ".xyz/" }
                    ]}
                    columnDefs={[
                        { field: "ensResolver", headerName: 'ENS Resolver', flex: 1 },
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


export default AddressToENSInfoTable;