import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { selectCoin } from '../../redux/reducer/coinSelectionReducer';
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid
import { useNavigate } from 'react-router';

const PricesInfoTable = (props) => {
    const { coinData } = props;
    
    const dispatch = useDispatch(); // Dispatch hook for updating coin selection redux state
    const navigate = useNavigate(); // Navigate hook for navigating to different routes
    
    const [filterText, updateFilterText] = useState(''); // Filter text state

    let coinTableRowData = [];

    // Loop through the coinData object to construct row data to be inserted into the prices table
    for (var i = 0; i < coinData.length; i++) {
        let item = {
            id: coinData[i].id,
            name: coinData[i].name,
            symbol: String(coinData[i].symbol).toUpperCase() + " - " + coinData[i].image,
            currentPrice: "$" + String(Number(coinData[i].current_price)),
            highPrice: "$" + String(Number(coinData[i].high_24h)),
            lowPrice: "$" + String(Number(coinData[i].low_24h)),
            percentageChange24Hours: coinData[i].price_change_percentage_24h >= 0 ? "+" + String(Number(coinData[i].price_change_percentage_24h).toFixed(2)) + "%" : String(Number(coinData[i].price_change_percentage_24h).toFixed(2)) + "%",
            marketCap: "$" + String(Number(coinData[i].market_cap).toFixed(2)),
            totalVolume: "$" + String(Number(coinData[i].total_volume).toFixed(2))
        };

        coinTableRowData.push(item);
        item = {};
    }

    // Column Definitions: Defines the columns to be displayed.
    const [columnDefs, setColumnDefs] = useState([
        { field: "name", headerName: 'Name', flex: 0.5,
            cellRenderer: (params) => {
                let filteredID = coinTableRowData.filter(coin => coin.name === params.value)[0].id;
                return (
                    <a style={{ color: 'black' }} href="/chart" onClick={ () => dispatch(selectCoin(filteredID)) }>{ params.value }</a>
                )
            }
         },
        { field: "symbol", headerName: "Symbol", flex: 0.25,
            cellRenderer: (params) => {
                return (
                    <p><img src={ params.value.split(" - ")[1] } alt="Thumbnail" style={{ width: '20px', height: '20px' }} />{" "}{ params.value.split(" - ")[0] }</p>
                )
            }
        },
        { field: "currentPrice", headerName: "Price", flex: 1 },
        { field: "highPrice", headerName: "High Last 24 Hrs", flex: 1 },
        { field: "lowPrice", headerName: "Low Last 24 Hrs", flex: 1 },
        { field: "percentageChange24Hours", headerName: "24 Hr % Change", flex: 1,
            cellRenderer: (params) => {
                return (
                    <p style={{ color: String(params.value).charAt(0) === '+' ? 'green' : 'red' }}><b>{ params.value }</b></p>
                )
            }
         },
        { field: "marketCap", headerName: "Market Cap", flex: 1 },
        { field: "totalVolume", headerName: "Total Volume", flex: 1 }
    ]);

    // Adding a filter to the table to allow users to search for specific coins
    // Filtering based on name and symbol of a particular coin
    const filteredRowData = coinTableRowData.filter(
        (row) =>
          row.name.toLowerCase().includes(filterText) ||
          row.symbol.toLowerCase().includes(filterText)
    );

    // Function for handling column renders on window screen size
    // Conditionally render the columns based on size
    // Filtering IDs to be used for coin selection, by filtering elements by their name
    // Adding color to price changes
    const updateColumnDefs = () => {
        if (window.outerWidth < 750) {
            setColumnDefs([
                { field: "name", headerName: 'Name', flex: 0.75,
                    cellRenderer: (params) => {
                        let filteredID = coinTableRowData.filter(coin => coin.name === params.value)[0].id;
                        return (
                            <a style={{ color: 'black' }} href="/chart" onClick={ () => dispatch(selectCoin(filteredID)) }>{ params.value }</a>
                        )
                    }
                 },
                { field: "currentPrice", headerName: "Price", flex: 0.75 },
                { field: "marketCap", headerName: "Market Cap", flex: 1 }
            ]);
        } 
        else if (window.outerWidth < 950) {
            setColumnDefs([
                { field: "name", headerName: 'Name', flex: 0.5,
                    cellRenderer: (params) => {
                        let filteredID = coinTableRowData.filter(coin => coin.name === params.value)[0].id;
                        return (
                            <a style={{ color: 'black' }} href="/chart" onClick={ () => dispatch(selectCoin(filteredID)) }>{ params.value }</a>
                        )
                    }
                 },
                { field: "currentPrice", headerName: "Price", flex: 0.75 },
                { field: "percentageChange24Hours", headerName: "24 Hr % Change", flex: 1,
                    cellRenderer: (params) => {
                        return (
                            <p style={{ color: String(params.value).charAt(0) === '+' ? 'green' : 'red' }}><b>{ params.value }</b></p>
                        )
                    }
                 },
                { field: "marketCap", headerName: "Market Cap", flex: 1 }
            ]);
        } 
        else if (window.outerWidth < 1200){
            setColumnDefs([
                { field: "name", headerName: 'Name', flex: 0.75,
                    cellRenderer: (params) => {
                        let filteredID = coinTableRowData.filter(coin => coin.name === params.value)[0].id;
                        return (
                            <a style={{ color: 'black' }} href="/chart" onClick={ () => dispatch(selectCoin(filteredID)) }>{ params.value }</a>
                        )
                    }
                 },
                { field: "symbol", headerName: 'Symbol', flex: 0.5,
                    cellRenderer: (params) => {
                        return (
                            <p><img src={ params.value.split(" - ")[1] } alt="Thumbnail" style={{ width: '20px', height: '20px' }} />{" "}{ params.value.split(" - ")[0] }</p>
                        )
                    }
                 },
                { field: "currentPrice", headerName: "Price", flex: 0.65 },
                { field: "percentageChange24Hours", headerName: "24 Hr % Change", flex: 0.65,
                    cellRenderer: (params) => {
                        return (
                            <p style={{ color: String(params.value).charAt(0) === '+' ? 'green' : 'red' }}><b>{ params.value }</b></p>
                        )
                    }
                 },
                { field: "marketCap", headerName: "Market Cap", flex: 0.85 },
                { field: "totalVolume", headerName: "Total Volume", flex: 0.85 }
            ]);
        }
        else {
            setColumnDefs([
                { field: "name", headerName: 'Name', flex: 0.75,
                    cellRenderer: (params) => {
                        let filteredID = coinTableRowData.filter(coin => coin.name === params.value)[0].id;
                        return (
                            <a style={{ color: 'black' }} href="/chart" onClick={ () => dispatch(selectCoin(filteredID)) }>{ params.value }</a>
                        )
                    }
                 },
                { field: "symbol", headerName: 'Symbol', flex: 0.5,
                    cellRenderer: (params) => {
                        return (
                            <p><img src={ params.value.split(" - ")[1] } alt="Thumbnail" style={{ width: '20px', height: '20px' }} />{" "}{ params.value.split(" - ")[0] }</p>
                        )
                    }
                 },
                { field: "currentPrice", headerName: "Price", flex: 0.65 },
                { field: "highPrice", headerName: "High Last 24 Hrs", flex: 0.65 },
                { field: "lowPrice", headerName: "Low Last 24 Hrs", flex: 0.65 },
                { field: "percentageChange24Hours", headerName: "24 Hr % Change", flex: 0.65,
                    cellRenderer: (params) => {
                        return (
                            <p style={{ color: String(params.value).charAt(0) === '+' ? 'green' : 'red' }}><b>{ params.value }</b></p>
                        )
                    }
                 },
                { field: "marketCap", headerName: "Market Cap", flex: 0.85 },
                { field: "totalVolume", headerName: "Total Volume", flex: 0.85 }
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
            <hr style={{ marginTop: '3rem' }} />
            <p style={{ marginTop: '2rem' }}><i>Data of the <b>Top 100</b> Cryptocurrencies by Market Cap</i></p>
            <input className='form-control' onChange={ e => updateFilterText(e.target.value.toLowerCase()) }placeholder="Quick coin filter" style={{ marginLeft: 'auto', marginRight: 'auto', width: '50%' }} />
            <div className="ag-theme-quartz" style={{ marginTop: '1rem', marginLeft: 'auto', marginRight: 'auto', height: 400, width: '100%' }}>
                <AgGridReact
                    rowData={filteredRowData}
                    columnDefs={columnDefs} />
            </div>
        </>
    )
}

export default PricesInfoTable;