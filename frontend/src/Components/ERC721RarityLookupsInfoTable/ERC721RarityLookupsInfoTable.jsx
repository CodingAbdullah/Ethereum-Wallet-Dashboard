import React from 'react';

const ERC721RarityLookupsInfoTable = (props) => {
    const { data } = props;

    return (
        <>
            <h5>ERC721 Token Rarity Calculator</h5> 
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
                            data.data.map(record => {
                                return (
                                    <tr>                                
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
            <hr style={{ marginTop: '3rem', marginBottom: '3rem' }} />
        </>  
    )
}

export default ERC721RarityLookupsInfoTable;