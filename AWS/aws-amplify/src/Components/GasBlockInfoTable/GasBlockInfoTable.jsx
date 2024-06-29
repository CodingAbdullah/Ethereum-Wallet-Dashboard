import React, { useState } from 'react';
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid

// Custom function for handling color styling based on confidence level
const colourFunction = (confidence) => {
    let color = 'black';
    switch (confidence) {
        case 99:
            color = 'green';
            break;
        case 95:
            color = 'yellow';
            break;
        case 90:
            color = 'orange';
            break;
        case 80:
            color = 'red';
            break;
        default:
            break;
    }

    return color;
}

const GasBlockInfoTable = (props) => {
    const { information } = props;

    let rowData = [];
    let item = {};

    // Formulating row data to be inserted into table
    for (var i = 0; i < information.length; i++) {
        item = {
            confidence: information[i].confidence,
            price: information[i].price,
            maxPriorityFeePerGas: information[i].maxPriorityFeePerGas,
            maxFeePerGas: information[i].maxFeePerGas
        }
        rowData.push(item);
        item = {};
    }

    // Rendering custom colours to represent each of the confidence levels
    const [columnDefs, setColumnDefs] = useState([
        { field: "confidence", headerName: 'Confidence', flex: 1,
            cellRenderer: (params) => {
                return (
                    <p style={{ color: colourFunction(params.data.confidence) }}><b>{ params.value }</b></p>
                )
            }
         },
        { field: "price", headerName: "Price (GWei)", flex: 1, 
            cellRenderer: (params) => {
                return (
                    <p style={{ color: colourFunction(params.data.confidence) }}><b>{ Number(params.value) + ' GWei' }</b></p>
                )
            }
        },
        { field: "maxPriorityFeePerGas", headerName: "Max Priority Fee Per Gas", flex: 1,
            cellRenderer: (params) => {
                return (
                    <p style={{ color: colourFunction(params.data.confidence) }}><b>{ '$' + Number(params.value).toFixed(2) }</b></p>
                )
            }
         },
        { field: "maxFeePerGas", headerName: "Max Fee Per Gas", flex: 1,
            cellRenderer: (params) => {
                return (
                    <p style={{ color: colourFunction(params.data.confidence) }}><b>{ '$' + Number(params.value).toFixed(2) }</b></p>
                )
            }
         },
    ]);

    // Display the relevant API information passed from parent component        
    return (
        <>
            <hr style={{ marginTop: '3rem' }} />
            <p><b>Block Gas Price Information</b><br /><i>Gas prices needed to have an X% probability to enter next block</i></p>
            <div className="ag-theme-quartz" style={{ marginLeft: 'auto', marginRight: 'auto', height: 200, width: '100%' }}>
                <AgGridReact
                    rowData={rowData}
                    columnDefs={columnDefs} />
            </div>
        </>
    )
}

export default GasBlockInfoTable;