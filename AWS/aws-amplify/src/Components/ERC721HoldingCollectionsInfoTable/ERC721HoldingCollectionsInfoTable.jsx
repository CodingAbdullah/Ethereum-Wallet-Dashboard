import React, { useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid

const ERC721HoldingCollectionsInfoTable = (props) => {
    const { data } = props; // Destructure data

    // Column Definitions: Defines the columns to be displayed.
    const [columnDefs, setColumnDefs] = useState([]);
    
    let coinTableRowData = [];
    let item = {};

    // Transform row data and conform it to column name
    for (var i = 0; i < data.length; i++) {
        item = {
            collectionAddress: data[i].token_address,
            name: data[i].name,
            symbol: data[i].symbol,
            type: data[i].contract_type,
            verifiedCollection: data[i].verified_collection,
            collectionLogo: data[i].collection_logo
        }

        coinTableRowData.push(item);
        item = {};
    }

    // Function for handling column renders on window screen size
    const updateColumnDefs = () => {
        if (window.outerWidth < 500) {
            setColumnDefs([
                { field: "name", headerName: 'Name', flex: 1,
                    cellRenderer: (params) => {
                        return <>{params.value ? params.value : "N/A"}</>
                    }
                 },
                { field: "symbol", headerName: "Symbol", flex: 1,
                    cellRenderer: (params) => {
                        return <>{params.value ? params.value : "N/A"}</>
                    }
                 },
                { field: "collectionLogo", headerName: "Logo", flex: 0.5,
                    cellRenderer: (params) => {
                        return <img src={ params.value } alt="No Logo" style={{ marginTop: '0.15rem', marginBottom: '0.25rem', width: '30px', height: '25px' }} />
                    }
                }
            ]);
        } 
        else if (window.outerWidth < 1000) {
            setColumnDefs([
                { field: "name", headerName: 'Name', flex: 1,
                    cellRenderer: (params) => {
                        return <>{params.value ? params.value : "N/A"}</>
                    }
                 },
                { field: "symbol", headerName: "Symbol", flex: 1,
                    cellRenderer: (params) => {
                        return <>{params.value ? params.value : "N/A"}</>
                    }
                 },
                { field: "collectionLogo", headerName: "Logo", flex: 0.5,
                    cellRenderer: (params) => {
                        return <img src={ params.value } alt="No Logo" style={{ marginTop: '0.15rem', marginBottom: '0.25rem', width: '30px', height: '25px' }} />
                    }
                },
                { field: "type", headerName: "Type", flex: 0.75 },
            ]);
        }
        else if (window.outerWidth < 1250) {
            setColumnDefs([
                { field: "name", headerName: 'Name', flex: 1,
                    cellRenderer: (params) => {
                        return <>{params.value ? params.value : "N/A"}</>
                    }
                 },
                { field: "symbol", headerName: "Symbol", flex: 1,
                    cellRenderer: (params) => {
                        return <>{params.value ? params.value : "N/A"}</>
                    }
                 },
                { field: "collectionLogo", headerName: "Logo", flex: 1,
                    cellRenderer: (params) => {
                        return <img src={ params.value } alt="No Logo" style={{ marginTop: '0.15rem', marginBottom: '0.25rem', width: '30px', height: '25px' }} />
                    }
                },
                { field: 'collectionAddress', headerName: 'Collection Address', flex: 1 },
                { field: "type", headerName: "Type", flex: 0.5 }
            ]);
        }
        else {
            setColumnDefs([
                { field: "name", headerName: 'Name', flex: 1,
                    cellRenderer: (params) => {
                        return <>{params.value ? params.value : "N/A"}</>
                    }
                },
                { field: "symbol", headerName: "Symbol", flex: 1,
                    cellRenderer: (params) => {
                        return <>{params.value ? params.value : "N/A"}</>
                    }
                 },
                { field: "collectionLogo", headerName: "Logo", flex: 0.5,
                    cellRenderer: (params) => {
                        return <img src={ params.value } alt="No Logo" style={{ marginTop: '0.15rem', marginBottom: '0.25rem', width: '30px', height: '25px' }} />
                    }
                },
                { field: 'collectionAddress', headerName: 'Collection Address', flex: 1 },
                { field: "type", headerName: "Type", flex: 0.5 },
                { field: 'verifiedCollection', headerName: 'Verified', flex: 0.5,
                    cellRenderer: (params) => {
                        return params.value ? 'Yes' : 'No';
                    }
                }
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
            <hr style={{ marginTop: '3rem' }} />
            <p><b>ERC721 Collection Holdings</b><br /><i>List of unique collections owned by wallet</i></p>
            <div className="ag-theme-quartz" style={{ marginLeft: 'auto', marginRight: 'auto', height: 200, width: '100%' }}>
                <AgGridReact
                    rowData={coinTableRowData}
                    columnDefs={columnDefs} />
            </div>
        </>
    )
}

export default ERC721HoldingCollectionsInfoTable;