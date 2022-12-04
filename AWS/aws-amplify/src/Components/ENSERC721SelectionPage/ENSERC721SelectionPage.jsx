import React from 'react';
import { useNavigate } from 'react-router';

const ENSERC721SelectionPage = () => {
    const navigate = useNavigate();

    return (
        <div>
            <main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-md-4">
                <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                    <h1 class="h2">ENS/ERC-721 Lookups</h1>
                </div>
                <div class="jumbotron">
                    <div class="container">
                        <div>
                            <label>ENS Lookups</label><button onClick={() => navigate("/ens-lookup/")} style={{marginLeft: '5.5rem'}} class='btn btn-success'>View</button>
                            <hr style={{marginTop: '2rem', marginBottom: '2rem'}} />
                            <label>ERC-721 Token Lookups</label><button style={{marginLeft: '1rem'}} onClick={() => navigate("/erc721-lookups")} class='btn btn-success'>View</button>
                        </div>
                    </div>
                </div>
            </main> 
        </div>
    )
}

export default ENSERC721SelectionPage;