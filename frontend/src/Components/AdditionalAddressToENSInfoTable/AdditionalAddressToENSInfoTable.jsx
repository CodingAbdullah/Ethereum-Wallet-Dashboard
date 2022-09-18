import axios from 'axios';
import React, { useState } from 'react';
import { useEffect } from 'react';

const AdditionalAddressToENSInfoTable = (props) => {
    const { data } = props;
    console.log(data.name.length);

    const [additionalEnsData, updateAdditionalEnsData] = useState({
        information: null
    });

    const ADDRESS_TO_ENS_TRANSPOSE_ENDPOINT = 'https://api.transpose.io/ens/ens-records-by-name?ens_names=' + data.name; // API URL

    const clearHandler = () => {
        updateAdditionalEnsData((prevState) => {
            return {
                ...prevState,
                information: null
            }
        });
    }

    useEffect(() => {        
        // One display, make API call for information
            const options = {   
                method: 'GET', 
                mode: 'no-cors',
                headers: { 
                    'Access-Control-Allow-Origin': '*', 
                    'X-API-KEY' : process.env.REACT_APP_TRANSPOSE_API_KEY, // Transpose API key hidden 
                    'Content-Type': 'application/json',
                },
               credentials: 'same-origin',
            }

            axios.get(ADDRESS_TO_ENS_TRANSPOSE_ENDPOINT, options) // Using Fetch API
            .then(response => {
                updateAdditionalEnsData((prevState) => { // Update Address to ENS for the display of tabulated information
                    return {
                        ...prevState,
                        information: response.data
                    }
                });
             })
            .catch((err) => {
                clearHandler();
                console.log(err);
            });   
    }, []);
     
    return (
        <div class="col-md-9 ml-sm-auto col-lg-10 px-md-4">
            { 
            additionalEnsData.information !== null ? (
                <table style={{border: '1px solid black'}}>
                    <thead style={{border: '1px solid black'}}>
                        <tr style={{border: '1px solid black'}}>
                            <th style={{border: '1px solid black'}} scope="col">Registration Date</th>
                            <th style={{border: '1px solid black'}} scope="col">Expiration Date</th>
                            <th style={{border: '1px solid black'}} scope="col">Grace Period Expiration</th>
                            <th style={{border: '1px solid black'}} scope="col">Premium Period Expiration</th>
                            <th style={{border: '1px solid black'}} scope="col">In Grace Period</th>
                            <th style={{border: '1px solid black'}} scope="col">In Premium Period</th>
                            <th style={{border: '1px solid black'}} scope="col">Is Expired</th>
                            <th style={{border: '1px solid black'}} scope="col">Last Refreshed</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style={{border: '1px solid black'}}>
                            <td style={{border: '1px solid black'}}>{additionalEnsData.information.results.registration_timestamp.split("Z")[0]}</td>
                            <td style={{border: '1px solid black'}}>{additionalEnsData.information.results.expiration_timestamp.split("Z")[0]}</td>
                            <td style={{border: '1px solid black'}}>{additionalEnsData.information.results.grace_period_ends.split("Z")[0]}</td>
                            <td style={{border: '1px solid black'}}>{additionalEnsData.information.results.premium_period_ends.split("Z")[0]}</td>
                            <td style={{border: '1px solid black'}}>{additionalEnsData.information.results.in_grace_period}</td>
                            <td style={{border: '1px solid black'}}>{additionalEnsData.information.results.in_premium_period}</td>
                            <td style={{border: '1px solid black'}}>{additionalEnsData.information.results.is_expired}</td>
                            <td style={{border: '1px solid black'}}>{additionalEnsData.information.results.last_refreshed.split("Z")[0]}</td>
                        </tr>
                    </tbody>
                </table>
            ) 
            : null }
        </div>
    )
}
export default AdditionalAddressToENSInfoTable;