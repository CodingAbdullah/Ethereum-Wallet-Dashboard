import React from 'react';

const ERC721CollectionFloorPriceInfoTable = (props) => {
    const { data } = props;
    const market_places = Object.keys(data.information); // Extract marketplace keys from data object

    let marketPlaceValues = []; // Map marketplace values into key-value pairs

    for (var i = 0; i < market_places.length; i++) {
        marketPlaceValues.push({ [market_places[i]]: data.information[market_places[i]] }); // Always be the same length as market_places
    }
    return (
        <div style={{marginTop: '3rem'}} className='col-md-9 ml-sm-auto col-lg-10 px-md-4 erc721-collection-floor-price-table'>
            <table style={{border: '1px solid black'}}>
                <thead style={{border: '1px solid black'}}>
                <tr style={{border: '1px solid black'}}>
                    <th style={{border: '1px solid black'}} scope="col">MarketPlace</th>
                    <th style={{border: '1px solid black'}} scope="col">Floor Price</th>
                    <th style={{border: '1px solid black'}} scope="col">Currency</th>
                    <th style={{border: '1px solid black'}} scope="col">Retrieve Date</th>
                    <th style={{border: '1px solid black'}} scope="col">Collection-URL</th>
                </tr>
                </thead>
                <tbody>
                    {
                        // Render values from the dynamically created array of objects mapped into a single array
                        marketPlaceValues.map((marketplace, key) => {
                            return (
                                <tr id={key} style={{border: '1px solid black'}}>
                                    <td style={{border: '1px solid black'}}>{Object.keys(marketplace)[0]}</td>
                                    <td style={{border: '1px solid black'}}>{marketplace[Object.keys(marketplace)[0]].floorPrice}</td>
                                    <td style={{border: '1px solid black'}}>{marketplace[Object.keys(marketplace)[0]].priceCurrency}</td>
                                    <td style={{border: '1px solid black'}}>{marketplace[Object.keys(marketplace)[0]].retrievedAt.split("T")[0] + ' - ' + (marketplace[Object.keys(marketplace)[0]].retrievedAt).split("T")[1].split(".")[0]}</td>
                                    <td style={{border: '1px solid black'}}><a href={marketplace[Object.keys(marketplace)[0]].collectionUrl} target="_blank" rel="noreferrer" >{marketplace[Object.keys(marketplace)[0]].collectionUrl}</a></td>
                                </tr>
                            )
                        })
                    }
                </tbody>
            </table>
        </div>  
    )    
}

export default ERC721CollectionFloorPriceInfoTable;