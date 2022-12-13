import axios from 'axios';
import React, { useState } from 'react';
import { useEffect } from 'react';

const AdditionalAddressToENSInfoTable = (props) => {
    const { name, address } = props;
    
    const [additionalEnsData, updateAdditionalEnsData] = useState({
        information: null
    });

    const NODE_SERVER_ADDRESS = 'http://localhost:5000/' // Our node server from the backend
    const ADDITIONAL_INFORMATION_ENDPOINT = 'additional-address-to-ens-information'; // Personal Node server endpoint
    const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms)); // Set timeout for ENS information display

    const clearHandler = () => {
        updateAdditionalEnsData((prevState) => {
            return {
                ...prevState,
                information: null
            }
        });
    }

    useEffect(() => { 
        const fetchAdditionalENSInfo = async () => {
            await delay();
            let location = window.location.pathname;

            const options = {
                method: 'POST',
                mode: 'cors',
                body: JSON.stringify({ ensName: location === '/ens-lookup/address-to-ens-lookup' ? name : address }),
                headers: {
                    'content-type': 'application/json'
                }
            }       

            axios.post(NODE_SERVER_ADDRESS + ADDITIONAL_INFORMATION_ENDPOINT, options) // Using Axios, make API call to node server
            .then(response => {
                console.log(response.data);
                updateAdditionalEnsData((prevState) => { // Update Address to ENS for the display of tabulated information
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
        } 
        fetchAdditionalENSInfo(); 
    }, [address, name]);

    if (additionalEnsData.information === null){
        return <div role="main" class="col-md-9 ml-sm-auto col-lg-10 px-md-4">Loading...</div>
    }
    else { 
        if (window.location.pathname === '/ens-lookup/address-to-ens-lookup') {
            return null;
        }
        else {
            return (
                    <div>
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
                                    <td style={{border: '1px solid black'}}>{additionalEnsData.information.results[0].registration_timestamp.split("Z")[0]}</td>
                                    <td style={{border: '1px solid black'}}>{additionalEnsData.information.results[0].expiration_timestamp.split("Z")[0]}</td>
                                    <td style={{border: '1px solid black'}}>{additionalEnsData.information.results[0].grace_period_ends.split("Z")[0]}</td>
                                    <td style={{border: '1px solid black'}}>{additionalEnsData.information.results[0].premium_period_ends.split("Z")[0]}</td>
                                    <td style={{border: '1px solid black'}}>{additionalEnsData.information.results[0].in_grace_period === false ? "No" :  "Yes"}</td>
                                    <td style={{border: '1px solid black'}}>{additionalEnsData.information.results[0].in_premium_period === false ? "No" : "Yes"}</td>
                                    <td style={{border: '1px solid black'}}>{additionalEnsData.information.results[0].is_expired === false ? "No" : "Yes"}</td>
                                    <td style={{border: '1px solid black'}}>{additionalEnsData.information.results[0].last_refreshed.split("Z")[0]}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
            )
        }
    }
}
export default AdditionalAddressToENSInfoTable;