import React, { useState } from 'react';
import { useNavigate } from 'react-router';

const CollectionsPage = () => {
    const navigate = useNavigate();
    const [collectionURL, updateCollectionURL] = useState("erc720-collection");

    // Collection handler function to manage collection analytics navigation
    const collectionHandler = e => {
        updateCollectionURL(e.target.value);
    }

    return (
        <div>
            <main role="main" className="p-3">
                <div>                    
                    <h1>Token Analytics</h1>
                    <hr />
                </div>
                <div className="jumbotron">
                    <div className="container">
                        <p className="lead text-muted"><i>Select collection type below for a quick analysis!</i></p>
                        <select style={{ marginLeft: 'auto', marginRight: 'auto', width: '50%' }} onChange={ collectionHandler } className="form-select" aria-label="Default select example">
                            <option selected value="erc720-collection">ERC20 Collection Analytics</option>
                            <option value="erc721-collection">ERC721 Collection Analytics</option>
                        </select>
                        <button style={{ marginTop: '1rem' }} className="btn btn-success" onClick={ () => navigate("/collections" + "/" + collectionURL) }>View</button>
                    </div>
                </div>
            </main> 
        </div> 
    )
}

export default CollectionsPage;