import React from 'react';

const HomePageDescriptionSection = (props) => {

    // Decoupled from home page to make components leaner, functions passed down from parent as props
    return (
        <div class="jumbotron">
            <div class="container">
                <p style={{ color: 'black' }} className='lead text-muted'>
                    <i>
                        Deep dive into wallet information, price action, and much more! Here is a link to all <b>EVM-compatible</b> chains and their IDs: <a style={{ color: 'black', fontStyle: 'italic' }} href="https://chainlist.org" target="_blank" rel="noreferrer"><b>ChainList. </b></a> 
                         Please note that most activity is found on the <b>mainnet</b> network. Some information might not be available on testnets.
                    </i>
                </p> 
                <form style={{ marginTop: '2rem'}} onSubmit={ props.form }>
                    <input style={{ marginLeft: 'auto', marginRight: 'auto', width: '50%' }} class="form-control mr-sm-2" type="search" placeholder="Enter wallet address" max="42" min="42" aria-label="Search" onChange={ props.updatingAddress } required />
                    <button class="btn btn-outline-success wallet-search-button" type="submit">Search! &raquo;</button>
                </form>
            </div>
        </div>
    )

}

export default HomePageDescriptionSection;