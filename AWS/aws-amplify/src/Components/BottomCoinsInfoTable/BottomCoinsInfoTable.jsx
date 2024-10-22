import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { selectCoin } from '../../redux/reducer/coinSelectionReducer';
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid

const BottomCoinsInfoTable = (props) => {
    const { bottomCoins } = props;

    let coinTableRowData = [];
    let item = {};

    const dispatch = useDispatch();

    // Fetch the top five losing coins
    for (var i = 0; i < 5; i++) {
        item = {
            id: bottomCoins[i].id,
            name: bottomCoins[i].name,
            symbol: String(bottomCoins[i].symbol).toUpperCase() + " - " + bottomCoins[i].image,
            currentPrice: "$" + bottomCoins[i].usd,
            marketCap: bottomCoins[i].market_cap,
            percentageChange24Hours: bottomCoins[i].usd_24h_change >= 0 ? "+" + bottomCoins[i].usd_24h_change.toFixed(2) + "%" : bottomCoins[i].usd_24h_change.toFixed(2) + "%"
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
        { field: "marketCap", headerName: "Market Cap", flex: 1 },
        { field: "percentageChange24Hours", headerName: "24 Hr % Change", flex: 1,
            cellRenderer: (params) => {
                return (
                    <p style={{ color: 'red' }}><b>{params.value}</b></p>
                )
            }
         }
    ]);

    // Render Ag-Grid React component with row and column data
    // Display coin price data
    return (
        <>
            <hr style={{ marginTop: '3rem' }} />
            <p style={{ marginTop: '2rem' }}><i><b>Top 5 Losing</b> Cryptocurrencies</i></p>
            <div className="ag-theme-quartz" style={{ marginTop: '1rem', marginLeft: 'auto', marginRight: 'auto', height: 260, width: '100%' }}>
                <AgGridReact
                    rowData={coinTableRowData}
                    columnDefs={columnDefs} />
            </div>
        </>
    )
}

export default BottomCoinsInfoTable;