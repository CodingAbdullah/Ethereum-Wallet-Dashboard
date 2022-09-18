import axios from 'axios';
import React, { useState } from 'react';
import { useEffect } from 'react';

const ENSResolverInfoTable = (props) => {
    const { address } = props;

    const [ensResolverData, updateEnsResolverData] = useState({
        information: null
    });

    const NODE_SERVER_ADDRESS = 'http://localhost:5000/' // Our node server from the backend
    const ADDITIONAL_INFORMATION_ENDPOINT = 'ens-resolver-information'; // Personal Node server endpoint

    const clearHandler = () => {
        updateEnsResolverData((prevState) => {
            return {
                ...prevState,
                information: null
            }
        });
    }

    useEffect(() => { 
        const options = {
            method: 'POST',
            body: JSON.stringify({ walletAddress: address }),
            headers: {
                'content-type': 'application/json'
            }
        }       

        axios.post(NODE_SERVER_ADDRESS + ADDITIONAL_INFORMATION_ENDPOINT, options) // Using Axios, make API call to node server
        .then(response => {
            updateEnsResolverData((prevState) => { // Update Address to ENS for the display of tabulated information
                return {
                    ...prevState,
                    information: response.data.information
                }
            });
        })
        .catch((err) => {
            clearHandler();
            console.log(err);
        });   
    }, [address]);
     
    if (ensResolverData.information === null){
        return <div role="main" class="col-md-9 ml-sm-auto col-lg-10 px-md-4">Loading...</div>
    }
    else {
        return (
            <div style={{marginLeft: '2rem'}}>
                { 
                ensResolverData.information !== null ? (
                    <table style={{border: '1px solid black', fontSize: '12.5px'}}>
                        <thead style={{border: '1px solid black', fontSize: '12.5px'}}>
                            <tr style={{border: '1px solid black', fontSize: '12.5x'}}>
                                <th style={{border: '1px solid black', fontSize: '12.5px'}} scope="col">ENS Name</th>
                                <th style={{border: '1px solid black', fontSize: '12.5px'}} scope="col">Registration Date</th>
                                <th style={{border: '1px solid black', fontSize: '12.5px'}} scope="col">Expiration Date</th>
                                <th style={{border: '1px solid black', fontSize: '12.5px'}} scope="col">Grace Period Expiration</th>
                                <th style={{border: '1px solid black', fontSize: '12.5px'}} scope="col">Premium Period Expiration</th>
                                <th style={{border: '1px solid black', fontSize: '12.5px'}} scope="col">In Grace Period</th>
                                <th style={{border: '1px solid black', fontSize: '12.5px'}} scope="col">In Premium Period</th>
                                <th style={{border: '1px solid black', fontSize: '12.5px'}} scope="col">Is Expired</th>
                                <th style={{border: '1px solid black', fontSize: '12.5px'}} scope="col">Last Refreshed</th>
                            </tr>
                        </thead>
                        <tbody>
                                {
                                    ensResolverData.information.results.map(record => {
                                        return (
                                            <tr style={{border: '1px solid black', fontSize: '12.5px'}}>
                                                <td style={{border: '1px solid black', fontSize: '12.5px'}}>{record.ens_name}</td>
                                                <td style={{border: '1px solid black', fontSize: '12.5px'}}>{record.registration_timestamp.split("Z")[0]}</td>
                                                <td style={{border: '1px solid black', fontSize: '12.5px'}}>{record.expiration_timestamp.split("Z")[0]}</td>
                                                <td style={{border: '1px solid black', fontSize: '12.5px'}}>{record.grace_period_ends.split("Z")[0]}</td>
                                                <td style={{border: '1px solid black', fontSize: '12.5px'}}>{record.premium_period_ends.split("Z")[0]}</td>
                                                <td style={{border: '1px solid black', fontSize: '12.5px'}}>{record.in_grace_period === false ? "No" :  "Yes"}</td>
                                                <td style={{border: '1px solid black', fontSize: '12.5px'}}>{record.in_premium_period === false ? "No" : "Yes"}</td>
                                                <td style={{border: '1px solid black', fontSize: '12.5px'}}>{record.is_expired === false ? "No" : "Yes"}</td>
                                                <td style={{border: '1px solid black', fontSize: '12.5px'}}>{record.last_refreshed.split("Z")[0]}</td>
                                            </tr>
                                        )
                                    })
                                }
                        </tbody>
                    </table>
                ) 
                : null }
            </div>
        )
    }
}
export default ENSResolverInfoTable;