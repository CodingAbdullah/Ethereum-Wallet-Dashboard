import React from 'react';

const ERC721CollectionAttributeSummaryInfoTable = (props) => {
    const { data } = props;
    const traitKeys = Object.keys(data.information.summary);
    
    let keyAttributeList = [];
    let keySubAttributePairs = [];

    // Iterate through attributes and nested attributes and reconfigure to array within array setup for mapping using keys
    for (var i = 0; i < traitKeys.length; i++) {
        let subTraitKeys = Object.keys(data.information.summary[traitKeys[i]]); // Array of sub attribute keys from parent attribute
        
        for (var j = 0; j < subTraitKeys.length; j++){
            keySubAttributePairs.push({ [subTraitKeys[j]]: data.information.summary[traitKeys[i]][subTraitKeys[j]] })
        }

        keyAttributeList.push({ [traitKeys[i]] : keySubAttributePairs }); // Push to parent array
        keySubAttributePairs = []; // Reset child array for re-iteration of key-value pairs
    }
    
    // Map attributes and sub attributes into tables/sub-tables
    return (
        <div style={{marginLeft: '1rem'}}> 
                <table style={{border: '1px solid black', fontSize: '10.5px'}}>
                    <table style={{border: '1px solid black', fontSize: '10.5px'}}>
                        <tr style={{border: '1px solid black', fontSize: '10.5x'}}>
                            <th style={{border: '1px solid black', fontSize: '10.5px'}}>Attributes</th>
                            <th style={{border: '1px solid black', fontSize: '10.5px'}}>No. Within Collection</th>
                        </tr>
                            {
                                keyAttributeList.map(record => {
                                    return (
                                        <>
                                            <tr>
                                                <th style={{border: '1px solid black', fontSize: '10.5px'}}>{Object.keys(record)[0]}</th>
                                                <th style={{border: '1px solid black', fontSize: '10.5px'}}>Value</th>
                                            </tr>
                                                    {
                                                        record[Object.keys(record)[0]].map(subrecords => {
                                                            return (
                                                                <tr>
                                                                    <td>{Object.keys(subrecords)[0]}</td>
                                                                    <td>{subrecords[Object.keys(subrecords)[0]]}</td>
                                                                </tr>
                                                            )
                                                        })
                                                    }
                                        </>
                                    )
                                })
                            }
                    </table> 
                </table>
        </div>
    )
}

export default ERC721CollectionAttributeSummaryInfoTable;