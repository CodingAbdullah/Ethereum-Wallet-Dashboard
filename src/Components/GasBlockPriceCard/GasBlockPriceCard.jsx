import React from 'react';

const GasBlockPriceCard = (props) => {
    const { information } = props;

    let color = '';

    // Decide color scheme for border for each block price description
    switch (information.confidence) {
        case 99:
            color = 'green';
            break;
        case 95:
            color = 'yellow';
            break;
        case 90:
            color = 'orange';
            break;
        case 80:
            color = 'red';
            break;
        default:
            break;
    }

    if (information.confidence === 70) { // Filter out the last confidence level 
        return null;
    }
    else {
        // Display the relevant API information passed from parent component
        return (
            <div class="card" style={{width: '18rem', marginLeft: '0.25rem', borderColor: color}}>
                <div class="card-body">
                    <h4 class="card-title">Estimated Price</h4>
                    <p>Confidence: <b>{information.confidence}</b></p> 
                    <p>Price: <b>{information.price}</b></p> 
                    <p>Max Priority Fee Per Gas: <b>${information.maxPriorityFeePerGas}</b></p> 
                    <p>Max Fee Per Gas: <b>${information.maxFeePerGas}</b></p>
                </div>
            </div>
        )
    }
}

export default GasBlockPriceCard;