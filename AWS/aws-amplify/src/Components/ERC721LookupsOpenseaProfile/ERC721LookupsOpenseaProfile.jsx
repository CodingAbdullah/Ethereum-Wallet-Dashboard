import React, { useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid

const ERC721LookupsOpenseaProfile = (props) => {
    const { openseaTokenData } = props;

    // Column Definitions: Defines the columns to be displayed.
    const [columnDefs, setColumnDefs] = useState([
        { field: "openseaProfileInformation", headerName: 'Opensea Profile Information', flex: 1 },
        { field: "data", headerName: "Data", flex: 1 }
    ]);

    // Row Data: Defines the rows to be displayed.
    let rowData = [];

    // Add all the necessary fields and information for row data
    rowData.push({ openseaProfileInformation: 'Token Standard', data: String(openseaTokenData.nft.token_standard).toUpperCase() });
    rowData.push({ openseaProfileInformation: 'Creator Address', data: openseaTokenData.nft.creator });
    rowData.push({ openseaProfileInformation: 'Last Updated At', data: String(openseaTokenData.nft.updated_at).split("T")[0] });
    rowData.push({ openseaProfileInformation: 'Suspicious?', data: openseaTokenData.nft.is_suspicious ? 'YES' : 'NO' });
    
    // Conditionally add the owners field if it exists
    if (openseaTokenData.nft.owners !== null) {
        rowData.push({ openseaProfileInformation: 'Owner', data: openseaTokenData.nft.owners[0].address });
    }
    
    rowData.push({ openseaProfileInformation: 'Rarity', data: openseaTokenData.nft.rarity.rank });
    
    // Render Ag-Grid React component with row and column data
    return (
        <>
            <hr style={{ marginTop: '3rem' }} />
            <p><b>ERC721 Token Opensea Profile</b><br /><i>Opensea information related to the ERC721 token</i></p>
            { openseaTokenData.nft.display_image_url !== null ? <img src={openseaTokenData.nft.display_image_url } height="200" width="200" alt="No Token Image Found" /> : null } 
            <p><i>{ openseaTokenData.nft.name }</i></p>
            <div className="ag-theme-quartz" style={{ marginLeft: 'auto', marginRight: 'auto', height: 200, width: '100%' }}>
                <AgGridReact
                    rowData={rowData}
                    columnDefs={columnDefs} />
            </div>
        </>
    )
}

export default ERC721LookupsOpenseaProfile;