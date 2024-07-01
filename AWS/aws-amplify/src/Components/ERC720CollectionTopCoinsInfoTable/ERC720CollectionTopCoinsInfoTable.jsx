import React, { useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid

const ERC720CollectionTopCoinsInfoTable = (props) => {
    const { data } = props;

    let coinTableRowData = [];
    let item = {}

    // Formatting row data to be displayed in the ERC20 Collection Top Coins Info Table
    for (var i = 0; i < data.length; i++) {
        item = {
            tokenName: data[i].token_name,
            tokenSymbol: data[i].token_symbol,
            tokenLogo: data[i].token_logo,
            contractAddress: data[i].contract_address,
            priceUsd: data[i].price_usd,
            pricePercentChange: data[i]["price_24h_percent_change"],
            marketCap: data[i].market_cap_usd
        }
        coinTableRowData.push(item);
        item = {};
    }

    // Setting column definitions for the ERC20 Collection Top Coins Info Table
    const [columnDefs, setColumnDefs] = useState([
        { field: "tokenName", headerName: 'Name', flex: 1 },
        { field: "tokenSymbol", headerName: 'ticker', flex: 1 },
        { field: "tokenLogo", headerName: 'Logo', flex: 1,
            cellRenderer: (params) => {
                return (
                    <img src={ params.value } alt="No Logo" style={{ width: '25px', height: '25px' }} />
                )
            }
        },
        { field: "contractAddress", headerName: 'Contract Address', flex: 1 },
        { field: "priceUsd", headerName: 'Price (USD)', flex: 1,
            cellRenderer: (params) => {
                return <p>${params.value}</p>
            }
        },
        { field: "pricePercentChange", headerName: '24 Hr. % Change', flex: 1,
            cellRenderer: (params) => {
                return params.value >= 0 ? <p style={{ color: 'green' }}><b>{Number(params.value).toFixed(2)}%</b></p> : <p style={{ color: 'red' }}><b>{Number(params.value).toFixed(2)}%</b></p>
            }
        },
        { field: "marketCap", headerName: 'Market Cap', flex: 1,
            cellRenderer: (params) => {
                return <p>${params.value}</p>
            }
        }
    ]);    
    
    // Function for handling column renders on window screen size
    const updateColumnDefs = () => {
        if (window.outerWidth < 800) {
            setColumnDefs([
                { field: "tokenName", headerName: 'Name', flex: 1 },
                { field: "tokenSymbol", headerName: 'Ticker', flex: 1 },
                { field: "tokenLogo", headerName: 'Logo', flex: 1,
                    cellRenderer: (params) => {
                        return (
                            <img src={ params.value } alt="No Logo" style={{ width: '25px', height: '25px' }} />
                        )
                    }
                },
                { field: "priceUsd", headerName: 'Price (USD)', flex: 1,
                    cellRenderer: (params) => {
                        return <p>${params.value}</p>
                    }
                }
            ]);
        }
        else if (window.outerWidth < 1050) {
            setColumnDefs([
                { field: "tokenName", headerName: 'Token Name', flex: 1 },
                { field: "tokenSymbol", headerName: 'Token Symbol', flex: 1 },
                { field: "tokenLogo", headerName: 'Logo', flex: 1,
                    cellRenderer: (params) => {
                        return (
                            <img src={ params.value } alt="No Logo" style={{ width: '25px', height: '25px' }} />
                        )
                    }
                },
                { field: "priceUsd", headerName: 'Price (USD)', flex: 1,
                    cellRenderer: (params) => {
                        return <p>${params.value}</p>
                    }
                }, 
                { field: "pricePercentChange", headerName: '24 Hr. % Change', flex: 1,
                    cellRenderer: (params) => {
                        return params.value >= 0 ? <p style={{ color: 'green' }}><b>{Number(params.value).toFixed(2)}%</b></p> : <p style={{ color: 'red' }}><b>{Number(params.value).toFixed(2)}%</b></p>
                    }
                },
                { field: "marketCap", headerName: 'Market Cap', flex: 1,
                    cellRenderer: (params) => {
                        return <p>${params.value}</p>
                    }
                }
            ]);
        }
        else {
            setColumnDefs([
                { field: "tokenName", headerName: 'Name', flex: 1 },
                { field: "tokenSymbol", headerName: 'Ticker', flex: 1 },
                { field: "tokenLogo", headerName: 'Logo', flex: 1,
                    cellRenderer: (params) => {
                        return (
                            <img src={ params.value } alt="No Logo" style={{ width: '25px', height: '25px' }} />
                        )
                    }
                },
                { field: "contractAddress", headerName: 'Contract Address', flex: 1 },
                { field: "priceUsd", headerName: 'Price (USD)', flex: 1,
                    cellRenderer: (params) => {
                        return <p>${params.value}</p>
                    }
                },
                { field: "pricePercentChange", headerName: '24 Hr. % Change', flex: 1,
                    cellRenderer: (params) => {
                        return params.value >= 0 ? <p style={{ color: 'green' }}><b>{Number(params.value).toFixed(2)}%</b></p> : <p style={{ color: 'red' }}><b>{Number(params.value).toFixed(2)}%</b></p>
                    }
                },
                { field: "marketCap", headerName: 'Market Cap', flex: 1,
                    cellRenderer: (params) => {
                        return <p>${params.value}</p>
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
            <p><b>Top ERC20 Coins</b><br /><i>Look up the top ERC20 tokens by market cap</i></p>
            <div className="ag-theme-quartz" style={{ marginLeft: 'auto', marginRight: 'auto', height: 200, width: '100%' }}>
                <AgGridReact
                    rowData={coinTableRowData}
                    columnDefs={columnDefs} />
            </div>
        </>
    )
}

export default ERC720CollectionTopCoinsInfoTable;