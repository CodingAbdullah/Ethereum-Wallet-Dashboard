import React, { useState } from 'react';
import { useEffect } from 'react';

const PriceCoinCard = (props) => {
    const { name, coinInfo } = props; // Extract coin info for display purposes, passed down from the parent component price
    const [colorChange, updateColour] = useState("");

    const [relevantInfo, updateRelevantInfo] = useState({
        information: null
    });
    
    useEffect(() => {
        updateRelevantInfo((prevState) => {
            return {
                ...prevState,
                information: coinInfo
            }
        });
        
        // Update colour accordingly
        updateColour(coinInfo[Object.keys(coinInfo)[0]].usd_24h_change < 0 ? "red" : "green");

    }, []);

    if (relevantInfo.information === null){
        return <div>Loading...</div>
    }
    return (
            <div class="card" style={{width: '18rem'}}>
                <div class="card-body">
                    <h4 class="card-title">{name}</h4>
                    <p>Price: <b>${relevantInfo.information[Object.keys(coinInfo)[0]].usd} USD</b></p> 
                    <p style={{ display: 'inline' }}>24 Hr% Change: </p> 
                    <b><p style={{ display: 'inline', color: colorChange }}>{colorChange === "green" ? "+" + relevantInfo.information[Object.keys(coinInfo)[0]].usd_24h_change.toFixed(2) + "%" : relevantInfo.information[Object.keys(coinInfo)[0]].usd_24h_change.toFixed(2) + "%"}</p></b>
                </div>
            </div>
    )
}

export default PriceCoinCard;