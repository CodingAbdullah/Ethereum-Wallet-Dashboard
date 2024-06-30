import React from 'react';

const DurationSelector = (props) => {

    let location = window.location.pathname;

    // Set options for price duration calculation
    let optionsValue = (
        <select onChange={ props.priceDurationHandler } className="form-select" aria-label="Default select example">
            { location === '/collections/erc721-collection' ? null : <option selected value="24">Last 24 Hours</option> }
            { location === '/collections/erc721-collection' ? null : <option value="7">Last 7 Days</option> }
            <option value="14">Last 14 Days</option>
            <option value="30">Last 30 days</option>
        </select>
    )

    // Render the price duration selector
    return (
        <>
            <main style={{ marginLeft: 'auto', marginRight: 'auto', width: '50%' }} role="main">            
                <label style={{ marginTop: '1rem' }}>
                    <p style={{ marginBottom: '0.5rem' }}>Select Price Interval</p>
                </label>
                { optionsValue }
            </main>
            <hr style={{ marginTop: '2rem' }} />
        </>
    )
}

export default DurationSelector;