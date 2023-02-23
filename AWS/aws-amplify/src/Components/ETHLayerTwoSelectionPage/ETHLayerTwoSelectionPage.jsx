import React from 'react';
import { useNavigate } from 'react-router';

const ETHLayerTwoSelectionPage = () => {
    const navigate = useNavigate();

    // Adding a section for layer twos to general dashboard..
    return (
        <div className="eth-layer-two-selection-page">
            <main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-md-4">
                <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                    <h1 class="h2">Ethereum Layer Two Chains</h1>
                </div>
                <div class="jumbotron">
                    <div class="container">
                        <div>
                            <label>Arbitium</label><button onClick={ () => navigate( "/arbitium-w-dashboard" )} style={{ marginLeft: '5.5rem' }} class='btn btn-success'>View</button>
                            <hr style={{ marginTop: '2rem', marginBottom: '2rem' }} />    
                            <label>Optimism</label><button onClick={ () => navigate( "/optimism-w-dashboard" )} style={{ marginLeft: '5.5rem' }} class='btn btn-success'>View</button>
                            <hr style={{ marginTop: '2rem', marginBottom: '2rem' }} />     
                            <label>Immutable X</label><button onClick={ () => navigate( "/imx-w-dashboard" )} style={{ marginLeft: '5.5rem' }} class='btn btn-success'>View</button>
                            <hr style={{ marginTop: '2rem', marginBottom: '2rem' }} />
                            <label>Polygon</label><button onClick={ () => navigate( "/polygon-w-dashboard" )} style={{ marginLeft: '5.5rem' }} class='btn btn-success'>View</button>
                        </div>
                    </div>
                </div>
            </main> 
        </div>
    )
}

export default ETHLayerTwoSelectionPage;