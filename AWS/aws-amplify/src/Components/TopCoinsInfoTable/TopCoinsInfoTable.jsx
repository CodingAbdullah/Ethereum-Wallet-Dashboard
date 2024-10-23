import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { selectCoin } from '../../redux/reducer/coinSelectionReducer';
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid

const TopCoinsInfoTable = (props) => {
    const { topCoins } = props;

    let coinTableRowData = [];
    let item = {};

    const dispatch = useDispatch();

    // Fetch the top five gaining coins
    for (var i = 0; i < 5; i++) {
        item = {
            id: topCoins[i].id,
            name: topCoins[i].name,
            symbol: String(topCoins[i].symbol).toUpperCase() + " - " + topCoins[i].image,
            currentPrice: "$" + topCoins[i].usd,
            marketCap: topCoins[i].market_cap_rank,
            percentageChange24Hours: topCoins[i].usd_24h_change >= 0 ? "+" + topCoins[i].usd_24h_change.toFixed(2) + "%" : topCoins[i].usd_24h_change.toFixed(2) + "%"
        }

        coinTableRowData.push(item);
        item = {};
    }

    // Column Definitions: Defines the columns to be displayed.
    const [columnDefs, setColumnDefs] = useState([
        { field: "name", headerName: 'Name', flex: 1,
            cellRenderer: (params) => {
                let filteredID = coinTableRowData.filter(coin => coin.name === params.value)[0].id;
                return (
                    <a style={{ color: 'black' }} href="/chart" onClick={ () => dispatch(selectCoin(filteredID)) }>{ params.value }</a>
                )
            }
         },
        { field: "symbol", headerName: "Symbol", flex: 1, 
            cellRenderer: (params) => {
                return (
                    <p><img src={ params.value.split(" - ")[1] } alt="Thumbnail" style={{ width: '20px', height: '20px' }} />{" "}{ params.value.split(" - ")[0] }</p>
                )
            }
        },
        { field: "currentPrice", headerName: "Price", flex: 1 },
        { field: "marketCap", headerName: "Market Cap Rank", flex: 1 },
        { field: "percentageChange24Hours", headerName: "24 Hr % Change", flex: 1,
            cellRenderer: (params) => {
                return (
                    <p style={{ color: 'green' }}><b>{params.value}</b></p>
                )
            }
         }
    ]);

        // Function for handling column renders on window screen size
    const updateColumnDefs = () => {
        if (window.outerWidth < 800) {
            setColumnDefs([
                { field: "name", headerName: 'Name', flex: 1,
                    cellRenderer: (params) => {
                        let filteredID = coinTableRowData.filter(coin => coin.name === params.value)[0].id;
                        return (
                            <a style={{ color: 'black' }} href="/chart" onClick={ () => dispatch(selectCoin(filteredID)) }>{ params.value }</a>
                        )
                    }
                 },
                { field: "symbol", headerName: "Symbol", flex: 1, 
                    cellRenderer: (params) => {
                        return (
                            <p><img src={ params.value.split(" - ")[1] } alt="Thumbnail" style={{ width: '20px', height: '20px' }} />{" "}{ params.value.split(" - ")[0] }</p>
                        )
                    }
                },
                { field: "currentPrice", headerName: "Price", flex: 1 },
                { field: "marketCap", headerName: "Market Cap Rank", flex: 1 }
            ]);
        } 
        else {
            setColumnDefs([
                { field: "name", headerName: 'Name', flex: 1,
                    cellRenderer: (params) => {
                        let filteredID = coinTableRowData.filter(coin => coin.name === params.value)[0].id;
                        return (
                            <a style={{ color: 'black' }} href="/chart" onClick={ () => dispatch(selectCoin(filteredID)) }>{ params.value }</a>
                        )
                    }
                 },
                { field: "symbol", headerName: "Symbol", flex: 1, 
                    cellRenderer: (params) => {
                        return (
                            <p><img src={ params.value.split(" - ")[1] } alt="Thumbnail" style={{ width: '20px', height: '20px' }} />{" "}{ params.value.split(" - ")[0] }</p>
                        )
                    }
                },
                { field: "currentPrice", headerName: "Price", flex: 1 },
                { field: "marketCap", headerName: "Market Cap Rank", flex: 1 },
                { field: "percentageChange24Hours", headerName: "24 Hr % Change", flex: 1,
                    cellRenderer: (params) => {
                        return (
                            <p style={{ color: 'green' }}><b>{params.value}</b></p>
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
    // Display coin price data
    return (
        <>
            <p><i><b>Top 5 Winning</b> Cryptocurrencies</i></p>
            <div className="ag-theme-quartz" style={{ marginTop: '1rem', marginLeft: 'auto', marginRight: 'auto', height: 260, width: '100%' }}>
                <AgGridReact
                    rowData={coinTableRowData}
                    columnDefs={columnDefs} />
            </div>
        </>
    )
}

export default TopCoinsInfoTable;