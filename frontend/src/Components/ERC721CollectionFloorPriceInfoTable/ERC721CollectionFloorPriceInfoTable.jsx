import React from 'react';

const ERC721CollectionFloorPriceInfoTable = (props) => {
    const { data } = props;
    const market_places = Object.keys(data.information); // Extract marketplace keys from data object
//    market_places = ['opensea', 'lookrare'];
    /* data: { 
            information: { 
                opensea:   {}, 
                looksrare: {} 
            } 
        }
    */

    let marketPlaceValues = []; // Map marketplace values into key-value pairs

    for (var i = 0; i < market_places.length; i++) {
        marketPlaceValues.push({ [market_places[i]]: data.information[market_places[i]] }); // Always be the same length as market_places
    }
    return (
        <div style={{marginTop: '3rem', marginLeft: '15rem'}} className='col-md-9 ml-sm-auto col-lg-10 px-md-4 erc721-collection-floor-price-table'>
            <h5><b>Collection Floor Price</b></h5>
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
                        marketPlaceValues.map(marketplace => {
                            return (
                                <tr style={{border: '1px solid black'}}>
                                    <td style={{border: '1px solid black'}}>{Object.keys(marketplace)[0]}</td>
                                    <td style={{border: '1px solid black'}}>{marketplace[Object.keys(marketplace)[0]].floorPrice}</td>
                                    <td style={{border: '1px solid black'}}>{marketplace[Object.keys(marketplace)[0]].priceCurrency}</td>
                                    <td style={{border: '1px solid black'}}>{marketplace[Object.keys(marketplace)[0]].retrievedAt.split("T")[0] + ' - ' + (marketplace[Object.keys(marketplace)[0]].retrievedAt).split("T")[1].split("Z")[0].split(".")[0]}</td>
                                    <td style={{border: '1px solid black'}}>{marketplace[Object.keys(marketplace)[0]].collectionUrl}</td>
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