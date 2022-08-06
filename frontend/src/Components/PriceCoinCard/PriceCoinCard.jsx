import React, { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

const PriceCoinCard = (props) => {
    const { name, coinInfo } = props; // Extract coin info for display purposes, passed down from the parent component price
    const [colorChange, updateColour] = useState("");

    const [relevantInfo, updateRelevantInfo] = useState({
        information: null
    });

    const navigate = useNavigate();
    
    // Modify the name from the parent component
    const modifiedName = name.includes("-") ? name.split("-")[0].substring(0, 1).toUpperCase() + name.split("-")[0].substring(1, name.split("-")[0].length) : 
                         name.substring(0, 1).toUpperCase() + name.substring(1, name.length);
    
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
                    <img src={require("../../assets/images/eth.svg").default} width="75" height="75" alt="logo" /><br />
                    <h4 class="card-title">{modifiedName}</h4>
                    <p>Price: <b>${relevantInfo.information[Object.keys(coinInfo)[0]].usd} USD</b></p> 
                    <p style={{ display: 'inline' }}>24 Hr% Change: </p> 
                    <b><p style={{ display: 'inline', color: colorChange }}>
                    {   
                        colorChange === "green" ? 
                        "+" + relevantInfo.information[Object.keys(coinInfo)[0]].usd_24h_change.toFixed(2) + "%" : 
                        relevantInfo.information[Object.keys(coinInfo)[0]].usd_24h_change.toFixed(2) + "%"
                    }
                    </p></b>
                    <button class="btn btn-outline-primary wallet-search-button" onClick={() => { navigate("/ethChart") }}>View Price Action &raquo;</button>
                </div>
            </div>
    )
}

export default PriceCoinCard;