import React, { useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid

const ERC721RarityLookupsInfoTable = (props) => {
    const { data, address } = props; 
    
    // Column Definitions: Defines the columns to be displayed.
    const [columnDefs, setColumnDefs] = useState([]);
    
     let coinTableRowData = [];
     let item = {};
 
     // Transform row data and conform it to column name
     for (var i = 0; i < data.data.length; i++) {
         item = {
             attribute: data.data[i].trait_type,
             value: data.data[i].value,
             prevalence: ((data.data[i].prevalence)*100).toFixed(2) + "%",
         }
 
         coinTableRowData.push(item);
         item = {};
     }
   
    // Function for handling column renders on window screen size
    const updateColumnDefs = () => {
            setColumnDefs([
                { field: "attribute", headerName: 'Attribute', flex: 1 },
                { field: "value", headerName: "Value", flex: 1 },
                { field: "prevalence", headerName: "Prevalence", flex: 1 }
            ]);
    } 
    
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
            <p><b>ERC721 Rarity Information</b><br /><i>{ address }</i></p>
            <div className="ag-theme-quartz" style={{ marginLeft: 'auto', marginRight: 'auto', height: 200, width: '100%' }}>
                <AgGridReact
                    rowData={coinTableRowData}
                    columnDefs={columnDefs} />
            </div>
        </>
    )
}

export default ERC721RarityLookupsInfoTable;