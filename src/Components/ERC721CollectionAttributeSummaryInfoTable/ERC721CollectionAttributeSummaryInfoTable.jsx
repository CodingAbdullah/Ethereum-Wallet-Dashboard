import React, { useState } from 'react';
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid

const ERC721CollectionAttributeSummaryInfoTable = (props) => {
    const { data } = props;

    const [columnDefs, setColumnDefs] = useState([
        { field: "subAttribute", headerName: "Sub-Attribute", flex: 1 },
        { field: "quantity", headerName: "Quantity", flex: 1 },
   ]);

    const traitKeys = Object.keys(data.information.summary); // Fetch list of attributes in a collection
    let keySubAttributePairs = [];
    let rowItems = {};
    
    // Iterate through attributes and nested attributes and reconfigure to array within array setup for mapping using keys
    for (var i = 0; i < traitKeys.length; i++) {
        let subTraitKeys = Object.keys(data.information.summary[traitKeys[i]]); // Array of sub attribute keys from parent attribute
        
        for (var j = 0; j < subTraitKeys.length; j++){
            keySubAttributePairs.push({ [subTraitKeys[j]]: data.information.summary[traitKeys[i]][subTraitKeys[j]] })
        }

        rowItems[traitKeys[i]] = keySubAttributePairs;
        keySubAttributePairs = []; // Reset child array for re-iteration of key-value pairs
    }

    let rowValues = [];
    let item = {};

    // Mapping each sub attribute to { subAttribute, quantity } object to be inserted into separate tables
    for (var i = 0; i < traitKeys.length; i++) {
        let subAttributeArray = [];
        for (var j = 0; j < rowItems[traitKeys[i]].length; j++) {
            item = {
                subAttribute: Object.keys(rowItems[traitKeys[i]][j])[0],
                quantity: rowItems[traitKeys[i]][j][Object.keys(rowItems[traitKeys[i]][j])[0]]
            }

            subAttributeArray.push(item);
        }

        // Inserting each attribute and its sub attributes into a single row
        rowValues.push({ [traitKeys[i]]: subAttributeArray });
        item = {};
    }
            
    // Map attributes and sub attributes into tables/sub-tables
    return (
        <>
            {
                rowValues.map((trait, key) => {
                    return (
                        <>
                            <div style={{ marginLeft: 'auto', marginRight: 'auto', width: '50%' }}>
                                <p><b>{Object.keys(trait)[0]}</b></p>
                                <div className="ag-theme-quartz" style={{ marginTop: '1rem', marginLeft: 'auto', marginRight: 'auto', height: 150, width: '100%' }}>
                                    <AgGridReact
                                        rowData={trait[Object.keys(trait)[0]]}
                                        columnDefs={columnDefs} />
                                </div>
                            </div>
                            <br />
                        </>
                    )
                })
            }
        </>
    )
}

export default ERC721CollectionAttributeSummaryInfoTable;