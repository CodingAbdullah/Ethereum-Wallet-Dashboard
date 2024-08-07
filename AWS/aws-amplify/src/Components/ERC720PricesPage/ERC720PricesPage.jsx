import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Alert from '../Alert/Alert';
import ERC720PricesInfoTable from '../ERC720PricesInfoTable/ERC720PricesInfoTable';
import ERC720PricesChart from '../ERC720PricesChart/ERC720PricesChart';
import DurationSelector from '../DurationSelector/DurationSelector';
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid
import './ERC720PricesPage.css';

const ERC720TokenPricesPage = () => {
    const navigate = useNavigate();
    const tokenContractAddressRef = useRef();
    const [interval, updateInterval] = useState('24');
    const [formAlert, updateAlert] = useState("");

    // State for tracking ERC20 token information, prices, and current ERC20 price
    const [erc20Information, updateErc20Information] = useState({
      coinData: null
    });

    const [erc20Prices, updateErc20Prices] = useState({ 
      coinPrice: null
    });

    const [currentERC20Price, updateCurrentERC20Price] = useState({
      currentValue: null
    });

    const intervalHandler = e => {
      updateInterval(e.target.value);
    }

    // Fetch data based on interval change
    useEffect(() => {
      const URL = 'http://localhost:5000';
      const ERC20_PRICE_ENDPOINT = '/ERC20-coin-price-duration';

      // Checking if token value is defined before proceeding with API call
      if (tokenContractAddressRef.current.value && tokenContractAddressRef.current.value.length === 42 && tokenContractAddressRef.current.value.substring(0, 2) === "0x"){
        let options = {
            method: "POST",
            body: JSON.stringify({ contract: tokenContractAddressRef.current.value, interval }),
            headers: {
                'content-type' : 'application/json'
            }
        }
      
        // Request ERC20 token price information
        axios.post(URL + ERC20_PRICE_ENDPOINT, options)
        .then(response => {
          updateErc20Prices(prevState => {
            return {
              ...prevState,
              coinPrice: response.data.coinPrices
            }
          });
        })
        .catch(() => {
          updateAlert("invalid");
        });
      }
    }, 
    [interval, updateInterval]);

    // Clear all data when requested
    // Set toggle back to default
    const clearHandler = () => {
      updateAlert("");
      updateErc20Information(prevState => {
        return {
          ...prevState,
          coinData: null
        }
      });

      // Clearing all data
      updateErc20Prices(prevState => {
        return {
          ...prevState,
          coinPrice: null
        }
      });

      updateCurrentERC20Price(prevState => {
        return {
          ...prevState,
          currentValue: null
        }
      });
    }

    const formHandler = async (e) => {
      e.preventDefault();

      // Update and set token address to what was entered and update chart toggle
      if (tokenContractAddressRef.current.value && tokenContractAddressRef.current.value.length === 42 && tokenContractAddressRef.current.value.substring(0, 2) === "0x"){
        clearHandler();

        const URL = 'http://localhost:5000';
        const ERC20_INFO_ENDPOINT = '/ERC20-coin-information';
        const ERC20_PRICE_ENDPOINT = '/ERC20-coin-price-duration';
        const CURRENT_ERC20_PRICE_ENDPOINT = '/current-ERC20-price';

        let options = {
            method: "POST",
            body: JSON.stringify({ contract: tokenContractAddressRef.current.value, interval }),
            headers: {
                'content-type' : 'application/json'
            }
        }
        
        // Request ERC20 token price information
        axios.post(URL + ERC20_PRICE_ENDPOINT, options)
        .then(response => {
          updateErc20Prices(prevState => {
            return {
              ...prevState,
              coinPrice: response.data.coinPrices
            }
          });
        })
        .catch(() => {
          updateAlert("invalid");
        });

        // Request ERC20 token information
        axios.post(URL + ERC20_INFO_ENDPOINT, options)
        .then(response => {
          updateErc20Information(prevState => {
            return {
              ...prevState,
              coinData: response.data.ERC20CoinData
            }
          });
        })
        .catch(() => {
          updateAlert("invalid");
        });

        // Request ERC20 current price
        axios.post(URL + CURRENT_ERC20_PRICE_ENDPOINT, options)
        .then(response => {
          updateCurrentERC20Price(prevState => {
            return {
              ...prevState,
              currentValue: response.data.price
            }
          });
        })
        .catch(() => {
          updateAlert("invalid");
        });
      }
      else {
          if (formAlert === "invalid"){ // If the format is not of length 42 and start with 0x (hex), throw error
              e.target.reset();
          }
          else {
              updateAlert("invalid"); // If repeated multiple times, clear input and keep error as is
          }
      }
    }

    // Display Title, 24 Hour, Price % Change, Price of ERC20 Coin
    return (
      <div>
        <main role="main" className="p-3">
          <div>            
            <h1>ERC20 Token Market Data</h1>
            <hr />
          </div>
          { formAlert === "invalid" ? <div><Alert type="danger"/></div> : <div/> }
          <div class="jumbotron">
            <div class="container">
              <form onSubmit={ formHandler } style={{ marginTop: '1.5rem' }}>
                <p className="lead text-muted"><i>Enter ERC20 contract address (<b>ETH mainnet</b> only)</i></p>
                <input class="form-control" style={{ marginTop: '1rem', marginLeft: 'auto', marginRight: 'auto', width: '50%' }} type="text" ref={ tokenContractAddressRef } placeholder="Enter contract address" required />
                <button style={{ marginTop: '2rem' }} type="submit" class="btn btn-success">Check Data</button>
              </form>
              <div>
                <button style={{ marginTop: '2rem', display: 'inline' }} class='btn btn-primary' onClick={ () => navigate("/") }>Go Home</button>
                <button style={{ marginTop: '2rem', marginLeft: '2rem' }} class='btn btn-warning' onClick={ clearHandler }>Clear</button>              
              </div>
            </div>
          </div>
          {
            erc20Information.coinData !== null && currentERC20Price.currentValue !== null && formAlert === '' && erc20Prices.coinPrice !== null ? 
            <>
              <hr style={{ marginTop: '3rem' }} />
              <h2>{erc20Information.coinData.name}</h2>
              <i>{ erc20Information.coinData.contract_address }</i>
              <br />
              <img style={{ marginTop: '1rem', marginBottom: '1rem' }} src={erc20Information.coinData.image.small} />
              {
                Object.keys(erc20Information.coinData.description).length !== 0 ?
                    <p style={{ marginLeft: 'auto', marginRight: 'auto', width: '50%' }}><i>{ erc20Information.coinData.description.en }</i></p>
                : null
              }
              <ERC720PricesChart tokenPrice={ currentERC20Price.currentValue } coinInformation={ erc20Information.coinData } priceData={ erc20Prices.coinPrice } />
              <DurationSelector priceDurationHandler={ intervalHandler } />
              <ERC720PricesInfoTable coinInformation={ erc20Information.coinData } />
            </>
            : null
          }
        </main>
      </div>
    )
}   

export default ERC720TokenPricesPage;