import { useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid

const ERC721CollectionTrendsInfoTable = (props) => {
    const { data } = props;

    let coinTableRowData = [];
    let item = {};

    // Fetch the top ERC721 collections
    for (var i = 0; i < data.length; i++) {
        item = {
            collectionTitle: data[i].collection_title,
            collectionImage: data[i].collection_image,
            collectionAddress: data[i].collection_address,
            floorPriceUSD: "$" + data[i].floor_price_usd,
            floorPriceUSD24HrPercentChange: data[i].floor_price_usd_24hr_percent_change >= 0 ? "+" + Number(data[i].floor_price_usd_24hr_percent_change).toFixed(2) + "%" : Number(data[i].floor_price_usd_24hr_percent_change).toFixed(2) + "%",
            volumeUSD: "$" + data[i].volume_usd,
            volume24HrPercentChange: data[i].volume_24hr_percent_change >= 0 ? "+" + Number(data[i].volume_24hr_percent_change).toFixed(2) + "%" : Number(data[i].volume_24hr_percent_change).toFixed(2) + "%"
        }

        coinTableRowData.push(item);
        item = {};
    }

    // Column Definitions: Defines the columns to be displayed.
    const [columnDefs, setColumnDefs] = useState([
        { field: "collectionTitle", headerName: 'Name', flex: 0.85 },
        { field: "collectionImage", headerName: "Logo", flex: 0.75, 
            cellRenderer: (params) => {
                return (
                    <img src={ params.value } alt="No Logo" style={{ width: '20px', height: '20px' }} />
                )
            }
        },
        { field: "floorPriceUSD", headerName: "Floor Price", flex: 0.65 },
        { field: "floorPriceUSD24HrPercentChange", headerName: "24 Hr % Chg", flex: 0.5,
            cellRenderer: (params) => {
                return (
                    <p style={{ color: String(params.value).charAt(0) === '+' ? 'green' : 'red' }}><b>{params.value}</b></p>
                )
            }
        },
        { field: "volumeUSD", headerName: "Volume", flex: 0.5 },
        { field: "volume24HrPercentChange", headerName: "Vol. 24 Hr % Chg", flex: 0.75,
            cellRenderer: (params) => {
                return (
                    <p style={{ color: String(params.value).charAt(0) === '+' ? 'green' : 'red' }}><b>{params.value}</b></p>
                )
            }
        }
    ]);

    // Function for handling column renders on window screen size
    const updateColumnDefs = () => {
        if (window.outerWidth < 900) {
            setColumnDefs([
                { field: "collectionTitle", headerName: 'Name', flex: 0.95 },
                { field: "collectionImage", headerName: "Logo", flex: 0.5, 
                    cellRenderer: (params) => {
                        return (
                            <img src={ params.value } alt="No Logo" style={{ width: '20px', height: '20px' }} />
                        )
                    }
                },
                { field: "floorPriceUSD", headerName: "Floor Price", flex: 0.65 },
            ]);
        } 
        else {
            setColumnDefs([
                { field: "collectionTitle", headerName: 'Name', flex: 0.85 },
                { field: "collectionImage", headerName: "Logo", flex: 0.75, 
                    cellRenderer: (params) => {
                        return (
                            <img src={ params.value } alt="No Logo" style={{ width: '20px', height: '20px' }} />
                        )
                    }
                },
                { field: "floorPriceUSD", headerName: "Floor Price", flex: 0.65 },
                { field: "floorPriceUSD24HrPercentChange", headerName: "24 Hr % Chg", flex: 0.5,
                    cellRenderer: (params) => {
                        return (
                            <p style={{ color: String(params.value).charAt(0) === '+' ? 'green' : 'red' }}><b>{params.value}</b></p>
                        )
                    }
                },
                { field: "volumeUSD", headerName: "Volume", flex: 0.5 },
                { field: "volume24HrPercentChange", headerName: "Vol. 24 Hr % Chg", flex: 0.75,
                    cellRenderer: (params) => {
                        return (
                            <p style={{ color: String(params.value).charAt(0) === '+' ? 'green' : 'red' }}><b>{params.value}</b></p>
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
    // Display Top ERC721 Collections by Market Cap
    return (
        <>
            <div className="ag-theme-quartz" style={{ marginTop: '1rem', marginLeft: 'auto', marginRight: 'auto', height: 260, width: '100%' }}>
                <AgGridReact
                    rowData={coinTableRowData}
                    columnDefs={columnDefs} />
            </div>
        </>
    )
}

export default ERC721CollectionTrendsInfoTable;