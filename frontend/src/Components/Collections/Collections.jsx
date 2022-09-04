import React from 'react';
import { useNavigate } from 'react-router';

const Collections = () => {
    const navigate = useNavigate();

    return (
        <div>
            <main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-md-4">
                <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                    <h1 class="h2">Collections</h1>
                </div>
                <div style={{marginTop: '2.5rem'}}>
                    <label style={{marginTop: '1rem'}}><b>ERC720</b> Collection Analytics</label><button onClick={() => navigate("/collections/erc720-collection")} style={{marginLeft: '2rem'}} class='btn btn-success'>View</button>
                    <hr style={{marginTop: '2rem'}} />
                    <label style={{marginTop: '1rem'}}><b>ERC721</b> Collection Analytics</label><button onClick={() => navigate("/collections/erc721-collection")} style={{marginLeft: '2rem'}} class='btn btn-success'>View</button>
                </div>
            </main> 
        </div> 
    )
}

export default Collections;