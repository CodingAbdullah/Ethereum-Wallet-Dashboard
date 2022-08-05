import React, { useState } from 'react';
import { useEffect } from 'react';

const PriceCoinCard = (props) => {
    const { coinInfo } = props; // Extract coin info for display purposes, passed down from the parent component price
    const [colorChange, updateColour] = useState("");

    useEffect(() => {
        if (coinInfo.information.usd_24h_change < 0) {
            updateColour('red');
        }
        else {
            updateColour('green');
        }
    }, []);

    return (
            <div class="card" style={{width: '18rem'}}>
                <img src={require("../../assets/images/btc.svg").default} width="75" height="75" alt="logo" /><br /> 
                <div class="card-body">
                    <h4 class="card-title">Coin Title</h4>
                    <p>Price: <b>${coinInfo.information.bitcoin.usd} USD</b></p> 
                    <p style={{ display: 'inline' }}>24 Hr% Change: </p> 
                    <b><p style={{ display: 'inline', color: colorChange }}>{colorChange === "red" ? coinInfo.information.usd_24h_change.toFixed(2) + "%": "+" + coinInfo.information.bitcoin.usd_24h_change.toFixed(2) + "%"}</p></b>
                </div>
            </div>
    )
}

export default PriceCoinCard;