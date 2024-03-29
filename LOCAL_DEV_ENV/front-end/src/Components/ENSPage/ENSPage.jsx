import React from 'react';
import { useNavigate } from 'react-router';

const ENSPage = () => {
    const navigate = useNavigate();

    // Allow for navigation to different ENS lookups
    return (
        <div>
            <main role="main" className="p-3">
                <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                    <h1 class="h2">ENS Lookups</h1>
                </div>
                <div class="jumbotron">
                    <div class="container">
                        <div>
                            <label><b>Address { ' -----> ' } ENS</b></label><button onClick={() => navigate("/ens-lookup/address-to-ens-lookup")} style={{marginLeft: '4.8rem'}} class='btn btn-success'>View</button>
                            <hr style={{marginTop: '2rem', marginBottom: '2rem'}} />
                            <label><b>ENS { ' -----> ' } Address</b></label><button onClick={() => navigate("/ens-lookup/ens-to-address-lookup")} style={{marginLeft: '4.8rem'}} class='btn btn-success'>View</button>
                            <hr style={{marginTop: '2rem', marginBottom: '2rem'}} />
                            <label style={{marginRight: '0.1rem'}}><b>ENS Transfers By Name</b></label><button onClick={() => navigate("/ens-lookup/ens-transfers-by-name")} style={{marginLeft: '2.85rem'}} class='btn btn-success'>View</button>
                            <hr style={{marginTop: '2rem', marginBottom: '2rem'}} />
                            <label><b>ENS Transfers By Token Id</b></label><button onClick={() => navigate("/ens-lookup/ens-transfers-by-id")} style={{marginLeft: '1.65rem'}} class='btn btn-success'>View</button>
                        </div>
                    </div>
                </div>
            </main> 
        </div> 
    )
}

export default ENSPage;