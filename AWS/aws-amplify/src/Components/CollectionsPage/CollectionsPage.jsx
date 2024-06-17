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
                <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                    <h1 className="h2">Token Analytics</h1>
                </div>
                <div className="jumbotron">
                    <div className="container">
                        <p>Select collection type below for a quick analysis!</p>
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