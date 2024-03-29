import React from 'react';

const GasBaseFeeCard = (props) => {
    const { information } = props;

    // Return Estimated base fees using the Object.keys() operator for dealing with dynamic keys
    if (Object.keys(information)[0] === 'pending+5'){
        return null;
    }
    else {
        return (
            <div class="card" style={{ marginLeft: '0.25rem', width: '18rem' }}>
                <div class="card-body">
                    <h4 class="card-title">Estimated Base Fees</h4>
                    <p>Queue: <b>{Object.keys(information)[0]}</b></p> 
                    <p>Confidence: <b>{information[Object.keys(information)[0]][0].confidence}</b></p> 
                    <p>Base Fee: <b>${information[Object.keys(information)[0]][0].baseFee}</b></p> 
                </div>
            </div>
        )
    }
}

export default GasBaseFeeCard;