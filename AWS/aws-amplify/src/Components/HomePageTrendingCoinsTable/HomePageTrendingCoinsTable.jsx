import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { selectCoin } from '../../redux/reducer/coinSelectionReducer';
import numeral from 'numeral'; // Number formatting library
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid

// Useful utility function for formatting currency
const formatCurrency = (value, locale = 'en-US', currency = 'USD') => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(value);
};

const HomePageTrendingCoinsTable = (props) => {
    const { coins } = props;

    let coinTableRowData = [];
    let item = {};

    const dispatch = useDispatch();
    const navigate = useNavigate();

    for (var i = 0; i < 5; i++) {
        item = {
            id: coins[i].item.id,
            rank: coins[i].item.market_cap_rank,
            name: coins[i].item.name,
            symbol: coins[i].item.symbol + " - " + coins[i].item.small,
            marketCap: coins[i].item.data.market_cap,
            price: coins[i].item.data.price < 0.01 ? "$" + coins[i].item.data.price : formatCurrency(coins[i].item.data.price),
            priceChange: coins[i].item.data.price_change_percentage_24h.usd >= 0 ? "+" + numeral(coins[i].item.data.price_change_percentage_24h.usd).format('0.00') + '%' : numeral(coins[i].item.data.price_change_percentage_24h.usd).format('0.00') + '%'
        }

        coinTableRowData.push(item);
        item = {};
    }
    
    const [rowData, updateRowData] = useState(coinTableRowData);

    // Column Definitions: Defines the columns to be displayed.
    const [columnDefs, setColumnDefs] = useState([]);

    // Function for handling column renders on window screen size
    const updateColumnDefs = () => {
        if (window.outerWidth < 550) {
            setColumnDefs([
                { field: "name", headerName: 'Name', flex: 1,
                    cellRenderer: (params) => {
                        let filteredID = coinTableRowData.filter(coin => coin.name === params.value)[0].id;
                        return (
                            <a style={{ color: 'black' }} href="/chart" onClick={ () => dispatch(selectCoin(filteredID)) }>{ params.value }</a>
                        )
                    }
                },
                { field: "price", headerName: "Price", flex: 1 }    
            ]);
        } 
        else if (window.outerWidth < 1000) {
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
                { field: "price", headerName: "Price", flex: 1 }    
            ]);
        }
        else if (window.outerWidth < 1100) {
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
                { field: "price", headerName: "Price", flex: 1 } ,   
                { field: "priceChange", headerName: "Price Change", flex: 1,
                    cellRenderer: (params) => {
                        return (
                            <p style={{ color: String(params.value).charAt(0) === '+' ? 'green' : 'red' }}><b>{params.value}</b></p>
                        )
                    }
                 }
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
                { field: "price", headerName: "Price", flex: 1 } ,   
                { field: "priceChange", headerName: "Price Change", flex: 1,
                    cellRenderer: (params) => {
                        return (
                            <p style={{ color: String(params.value).charAt(0) === '+' ? 'green' : 'red' }}><b>{params.value}</b></p>
                        )
                    }
                 },
                { field: "rank", headerName: "Market Cap Rank", flex: 1 },    
                { field: "marketCap", headerName: "Market Cap", flex: 1 }
            ]);
        }
      };
    
      // Dynamically adjust table size depending on screen size
      useEffect(() => {
        updateColumnDefs();
        window.addEventListener('resize', updateColumnDefs);
        return () => window.removeEventListener('resize', updateColumnDefs);
      }, []);

    return (
        <div className="ag-theme-quartz" style={{ marginLeft: 'auto', marginRight: 'auto', height: 260, width: '100%' }}>
            <AgGridReact
                rowData={rowData}
                columnDefs={columnDefs} />
        </div>
    )
}

export default HomePageTrendingCoinsTable;