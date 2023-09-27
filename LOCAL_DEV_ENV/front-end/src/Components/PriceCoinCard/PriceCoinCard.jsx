import React from 'react';
import { useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { selectCoin } from '../../redux/reducer/coinSelectionReducer';

const PriceCoinCard = (props) => {
    const { name, coinInfo } = props; // Extract coin info for display purposes, passed down from the parent component price
    
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    // Modify the name from the parent component
    const modifiedName = name.includes("-") ? name.split("-")[0].substring(0, 1).toUpperCase() + name.split("-")[0].substring(1, name.split("-")[0].length) : 
                         name.substring(0, 1).toUpperCase() + name.substring(1, name.length);

    // Modifying imagery
    const imagery = modifiedName === 'Ethereum' ? 
                    <img src={require("../../assets/images/" + modifiedName.toLowerCase() + ".png")} width="85" height="100" alt="logo" /> :
                    <img src={require("../../assets/images/" + modifiedName.toLowerCase() + ".png")} width="90" height="100" alt="logo" />    
        
    // Function for handling requesting coin price information
    const priceButtonHandler = e => {
        e.preventDefault();
        dispatch(selectCoin(name));
        navigate("/chart");
    }

    return (
            <div className="card col-lg-4 col-md-6 col-sm-12">
                <div class="card-body">
                    { imagery }
                    <br />
                    <h4 class="card-title">{ modifiedName }</h4>
                    <p>
                        Price:  <b>${   coinInfo.usd < 1 ? 
                                        coinInfo.usd : 
                                      ( coinInfo.usd ).toFixed(2) 
                                    } USD
                                </b>
                    </p> 
                    <p style={{ display: 'inline' }}>24 Hr% Change: </p> 
                    <b><p style={{ display: 'inline', color: coinInfo.usd < 0 ? "red" : "green" }}>
                    {   
                        coinInfo.usd_24h_change >= 0 ? 
                        "+" + coinInfo.usd_24h_change.toFixed(2) + "%" : 
                        coinInfo.usd_24h_change.toFixed(2) + "%"
                    }
                    </p></b>
                    <br />
                    <button class="btn btn-outline-primary wallet-search-button" onClick={ priceButtonHandler }>View Price Action &raquo;</button>
                </div>
            </div>
        )
    }   

export default PriceCoinCard;