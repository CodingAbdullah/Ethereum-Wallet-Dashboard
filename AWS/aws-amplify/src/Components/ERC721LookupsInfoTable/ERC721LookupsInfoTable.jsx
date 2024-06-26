import React, { useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid

const ERC721LookupsInfoTable = (props) => {
    const { data, address } = props;     
    
    // Column Definitions: Defines the columns to be displayed.
    const [columnDefs, setColumnDefs] = useState([
        { field: "name", headerName: 'Collection Name', flex: 1 },
        { field: "link", headerName: "Link", flex: 1,
            cellRenderer: (params) => {
                return (
                    <a style={{ color: 'black' }} target='_blank' href={ params.value }>{ "NFT Link" }</a>
                )
            }
        }
    ]);
   
    // Function for handling column renders on window screen size
    const updateColumnDefs = () => {
        if (window.outerWidth < 900) {
            setColumnDefs([
                { field: "name", headerName: 'Collection Name', flex: 1 },
                { field: "link", headerName: "Link", flex: 1,
                    cellRenderer: (params) => {
                        return (
                            <a style={{ color: 'black' }} target='_blank' href={ params.value }>{ "NFT Link" }</a>
                        )
                    }
                }
            ]);
        } 
        else {
            setColumnDefs([
                { field: "name", headerName: 'Collection Name', flex: 1 },
                { field: "tokenId", headerName: "Token ID", flex: 1 },
                { field: "link", headerName: "Link", flex: 1,
                    cellRenderer: (params) => {
                        return (
                            <a style={{ color: 'black' }} target='_blank' href={ params.value }>{ "NFT Link" }</a>
                        )
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
            <p><b>ERC721 Token Lookup Information</b><br /><i>Brief Summary of ERC721 token</i></p>
            <div className="ag-theme-quartz" style={{ marginLeft: 'auto', marginRight: 'auto', height: 92.5, width: '100%' }}>
                <AgGridReact
                    rowData={[
                       { name: data.name, 
                         tokenId: data.token_id,
                         link: "https://opensea.io/assets/ethereum/" + data.token_address + "/" + data.token_id
                       }
                    ]}
                    columnDefs={columnDefs} />
            </div>
        </>
    )
}

export default ERC721LookupsInfoTable;