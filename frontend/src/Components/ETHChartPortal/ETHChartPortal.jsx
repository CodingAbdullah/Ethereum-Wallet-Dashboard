import React from 'react';
import { useEffect } from 'react';

const ETHChartPortal = () => {

    let result = null;
    const URL= "https://api.coingecko.com/api/v3";
    const id = "ethereum";
    const date = '04-05-2021'; // Sample date goes here, will include a dynamic way to add it later
    const API_ENDPOINT = "/coins/" + id + "/history?date=" + date;

    useEffect(() => {
        fetch(URL + API_ENDPOINT)
        .then(response => response.json())
        .then(res => {
            result = res; 
            console.log(res);
        })
        .catch(err => console.log(err));

    }, []);

    return (
        <div className='dashboard'>
            { result === null ? "Not available" : result }
        </div>
    )
}

export default ETHChartPortal;