import React from 'react';

const ERC20PricesInfoTable = (props) => {
    const { data } = props; // Destructure data

    return (
        // Display data of the valid ERC20 token
        <table>
            <thead>
              <tr>
                <th scope="col">Additional Token Information</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>Name</b></td>
                <td>{data.information.name}</td>
              </tr>
              <tr>
                <td><b>Contract Address</b></td>
                <td>{data.information.contract_address}</td>
              </tr>
              <tr>
                <td><b>Last Updated</b></td>
                <td>{data.information.last_updated.split('T')[0]}</td>
              </tr>
              <tr>
                <td><b>Total Supply</b></td>
                <td>{data.information.market_data.total_supply}</td>
              </tr>
              <tr>
                <td><b>Max Supply</b></td>
                <td>{data.information.market_data.max_supply}</td>
              </tr>
              <tr>
                <td><b>Circulating Supply</b></td>
                <td>{data.information.market_data.circulating_supply}</td>
              </tr>
              <tr>
                <td><b>24 Hr. Price % Change</b></td>
                <td style={{color: data.information.market_data.price_change_percentage_24h < 0 ? 'red' : 'green'}}>
                  <b>{data.information.market_data.price_change_percentage_24h > 0 ? "+" : ""}{data.information.market_data.price_change_percentage_24h.toFixed(2) + "%"}</b>
                </td>
              </tr>
              <tr>
                <td><b>24 Hr. Highest Price</b></td>
                <td>{data.information.market_data.high_24h.usd}</td>
              </tr>
              <tr>
                <td><b>24 Hr. Lowest Price</b></td>
                <td>{data.information.market_data.low_24h.usd}</td>
              </tr>
              <tr>
                <td><b>All-Time Lowest Price</b></td>
                <td>{data.information.market_data.atl.usd}</td>
              </tr>
              <tr>
                <td><b>All-Time Lowest Price Date</b></td>
                <td>{data.information.market_data.atl_date.usd.split("T")[0]}</td>
              </tr>
              <tr>
                <td><b>All-Time Highest Price</b></td>
                <td>{data.information.market_data.ath.usd}</td>
              </tr>
              <tr>
                <td><b>All-Time Highest Price Date</b></td>
                <td>{data.information.market_data.ath_date.usd.split("T")[0]}</td>
              </tr>
              <tr>
                <td><b>All-Time Highest Price to Current % Change</b></td>
                <td style={{color: data.information.market_data.ath_change_percentage.usd < 0 ? 'red' : 'green'}}>
                  <b>{data.information.market_data.ath_change_percentage.usd.toFixed(2) + "%"}</b>
                </td>
              </tr>
            </tbody>
        </table>   
    )
}

export default ERC20PricesInfoTable;