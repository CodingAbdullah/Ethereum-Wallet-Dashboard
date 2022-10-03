import React from 'react';
import Alert from '../Alert/Alert';

const ERC721RarityLookupsInfoTable = (props) => {
    const { data } = props;

    if (data.data === null) {
        return <Alert type='warning-unavailable-testnet' />
    }
    else {
        return (
            <>
                <div style={{marginLeft: '24rem'}}>
                    <table style={{border: '1px solid black'}}>
                        <thead style={{border: '1px solid black'}}>
                        <tr style={{border: '1px solid black'}}>
                            <th style={{border: '1px solid black'}} scope="col">Attribute</th>
                            <th style={{border: '1px solid black'}} scope="col">Value</th>
                            <th style={{border: '1px solid black'}} scope="col">Prevalence In Collection %</th>
                        </tr>
                        </thead>
                        <tbody>
                            { // Formatting the table rows to show data
                                data.data.map((record, key) => {
                                    return (
                                        <tr id={key}>                                
                                            <td style={{border: '1px solid black', fontSize: '11px'}}>{record.trait_type}</td>
                                            <td style={{border: '1px solid black', fontSize: '11px'}}>{record.value}</td>
                                            <td style={{border: '1px solid black', fontSize: '11px'}}>{((record.prevalence)*100).toFixed(2) + "%"}</td>
                                        </tr>
                                    )
                                })
                            }   
                        </tbody>
                    </table>
                </div>
            </>  
        )
    }
}

export default ERC721RarityLookupsInfoTable;