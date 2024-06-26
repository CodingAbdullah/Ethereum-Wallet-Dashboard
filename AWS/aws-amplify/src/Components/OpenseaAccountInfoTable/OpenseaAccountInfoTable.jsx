import { useState } from 'react';
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid

const OpenseaAccountInfoTable = (props) => {
    const { data } = props;
    
    // Column Definitions: Defines the columns to be displayed
    // Conditionally checking data for image url to display as image
    const [columnDefs, setColumnDefs] = useState([
        { field: "openseaAccountInformation", headerName: 'Opensea Account Information', flex: 1 },
        { field: "data", headerName: "Data", flex: 1,
            cellRenderer: function (params) {
                if (params.value.includes("https")) {
                    return <img src={params.value} alt="Profile Image" style={{ marginTop: '0.15rem', marginBottom: '0.15rem', width: '50px', height: '50px' }} />
                }
                else {
                    return <>{params.value}</>;
                }
            }
        }
    ]); 
    
    // Set an array to incorporate response data
    let rowData = [];

    // Conditionally construct rowData to be inserted into the table using response data
    if (data.username !== '') {
        rowData.push({ openseaAccountInformation: "Username", data: data.username });
    }

    if (data.profile_image_url !== '') {
        rowData.push({ openseaAccountInformation: "Profile Image", data: data.profile_image_url });
    }  

    if (data.banner_image_url !== '') {
        rowData.push({ openseaAccountInformation: "Banner Image URL", data: data.banner_image_url });
    }

    if (data.website !== '') {
        rowData.push({ openseaAccountInformation: "Website", data: data.website });
    }

    if (data.social_media_accounts.length > 0) {
        for (var i = 0; i < data.social_media_accounts.length; i++) {
            rowData.push({ 
                openseaAccountInformation: String(data.social_media_accounts[i].platform).charAt(0).toUpperCase() + String(data.social_media_accounts[i].platform).substring(1), 
                data: data.social_media_accounts[i].username 
            });
        }
    }

    if (data.bio !== '') {
        rowData.push({ openseaAccountInformation: "Bio", data: data.bio });
    }

    if (data.joined_date !== '') {
        rowData.push({ openseaAccountInformation: "Joined Date", data: data.joined_date });
    }

    const [rowDefs, setRowDefs] = useState(rowData);
      
    // Render Ag-Grid React component with row and column data
    // Display data of the valid ERC20 token
    return (
        <>
            <p><b>Opensea Account</b><br /><i>Profile information related to wallet address</i></p>
            <div className="ag-theme-quartz" style={{ marginTop: '1rem', marginLeft: 'auto', marginRight: 'auto', height: 200, width: '100%' }}>
                <AgGridReact
                    rowData={rowDefs}
                    columnDefs={columnDefs} />
            </div>
        </>
    )
}

export default OpenseaAccountInfoTable;