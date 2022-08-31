import React from 'react';

const Collections = () => {

    return (
        <main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-md-4">
            <h1>Collections</h1>
            <div style={{marginTop: '2.5rem'}}>
                <label>ERC720 Collection Analytics</label><button style={{marginLeft: '2rem'}}class='btn btn-success'>View</button>
                <br />
                <label style={{marginTop: '2rem'}}>ERC721 Collection Analytics</label><button style={{marginLeft: '2rem'}}class='btn btn-success'>View</button>
            </div>
        </main>  
    )
}

export default Collections;