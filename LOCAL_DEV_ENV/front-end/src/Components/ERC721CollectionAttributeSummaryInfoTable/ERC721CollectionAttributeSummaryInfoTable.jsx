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
    const tabulatedNestedAttributes = keyAttributeList.map((record, key) => {
        return (
                <>
                    <tr id={key}>
                        <th style={{border: '1px solid black', fontSize: '10.5px'}}>{Object.keys(record)[0]}</th>
                        <th style={{border: '1px solid black', fontSize: '10.5px'}}>-</th>
                    </tr>
                        {       
                            record[Object.keys(record)[0]].map((subrecords, key) => {
                                return (
                                    <tr id={key}>
                                        <td>{Object.keys(subrecords)[0]}</td>
                                        <td>{subrecords[Object.keys(subrecords)[0]]}</td>
                                    </tr>
                                )
                            })
                        }
                </>
        );
    });

    return (
            <div class="p-3">
                        {
                            tabulatedNestedAttributes.map((tabulatedValues, key) => {
                                return (
                                    <table id={key} class="p-3">
                                        <table style={{ marginBottom: '2rem', border: '1px solid black', fontSize: '10.5px', width: '100%' }}>
                                            <tr style={{ border: '1px solid black', fontSize: '10.5x' }}>
                                                <th style={{ border: '1px solid black', fontSize: '10.5px' }}>Attributes</th>
                                                <th style={{ border: '1px solid black', fontSize: '10.5px' }}>No. Within Collection</th>
                                            </tr>
                                            { tabulatedValues }
                                        </table>
                                    </table>
                                )
                            })
                        }
                </div>
    )
}

export default ERC721CollectionAttributeSummaryInfoTable;