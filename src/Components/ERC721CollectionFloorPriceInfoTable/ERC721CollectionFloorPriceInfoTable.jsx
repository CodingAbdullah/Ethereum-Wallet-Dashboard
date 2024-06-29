import React, { useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid

const ERC721CollectionFloorPriceInfoTable = (props) => {
    const { data } = props;
    const market_places = Object.keys(data.information); // Extract marketplace keys from data object
    
    const [columnDefs, setColumnDefs] = useState([
        { field: "marketPlace", headerName: "Market Place", flex: 0.5 },
        { field: "floorPrice", headerName: "Floor Price", flex: 0.5 },
        { field: "currency", headerName: "Currency", flex: 0.7 },
        { field: "retrievalDate", headerName: "Retrieval Date", flex: 0.5 },
        { field: "marketPlaceURL", headerName: "Market Place URL", flex: 0.7,
            cellRenderer: function (params) {
                return <a style={{ color: 'black' }} href={params.value} target='_blank' rel='noreferrer noopener'>Marketplace Link</a>
            }
        }
    ]);

    let marketPlaceValues = []; // Map marketplace values into key-value pairs
    let item = {};

    for (var i = 0; i < market_places.length; i++) {
        item = {
            marketPlace: market_places[i],
            floorPrice: data.information[market_places[i]].floorPrice,
            currency: data.information[market_places[i]].priceCurrency,
            retrievalDate: data.information[market_places[i]].retrievedAt.split("T")[0] + ' - ' + (data.information[market_places[i]].retrievedAt).split("T")[1].split(".")[0],
            marketPlaceURL: data.information[market_places[i]].collectionUrl
        }
        marketPlaceValues.push(item); // Always be the same length as market_places
        item = {};
    }

    // Function for handling column renders on window screen size
    const updateColumnDefs = () => {
        if (window.outerWidth < 750) {
            setColumnDefs([
                { field: "marketPlace", headerName: "Market Place", flex: 0.5 },
                { field: "floorPrice", headerName: "Floor Price", flex: 0.5 },
                { field: "marketPlaceURL", headerName: "Market Place URL", flex: 0.7,
                    cellRenderer: function (params) {
                        return <a style={{ color: 'black' }} href={params.value} target='_blank' rel='noreferrer noopener'>Marketplace Link</a>
                    }
                }
            ]);
        }
        else if (window.outerWidth < 850) {
            setColumnDefs([
                { field: "marketPlace", headerName: "Market Place", flex: 0.5 },
                { field: "floorPrice", headerName: "Floor Price", flex: 0.5 },
                { field: "retrievalDate", headerName: "Retrieval Date", flex: 0.5 },
                { field: "marketPlaceURL", headerName: "Market Place URL", flex: 0.7,
                    cellRenderer: function (params) {
                        return <a style={{ color: 'black' }} href={params.value} target='_blank' rel='noreferrer noopener'>Marketplace Link</a>
                    }
                }            
            ]);
        }
        else {
            setColumnDefs([
                { field: "marketPlace", headerName: "Market Place", flex: 0.5 },
                { field: "floorPrice", headerName: "Floor Price", flex: 0.5 },
                { field: "currency", headerName: "Currency", flex: 0.25 },
                { field: "retrievalDate", headerName: "Retrieval Date", flex: 0.5 },
                { field: "marketPlaceURL", headerName: "Market Place URL", flex: 0.7,
                    cellRenderer: function (params) {
                        return <a style={{ color: 'black' }} href={params.value} target='_blank' rel='noreferrer noopener'>Marketplace Link</a>
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

    // Render the ERC721 Collection Floor Price data using the Ag-Grid React component
    return (        
        <>
            <hr style={{ marginTop: '3rem' }} />
            <p><b>ERC721 Collection Floor Prices</b><br /><i>Check the floor price of the collection by marketplace</i></p>
            <div className="ag-theme-quartz" style={{ marginTop: '2rem', marginLeft: 'auto', marginRight: 'auto', height: 150, width: '100%' }}>
                <AgGridReact
                    rowData={marketPlaceValues}
                    columnDefs={columnDefs} />
            </div>
        </>
    )    
}

export default ERC721CollectionFloorPriceInfoTable;