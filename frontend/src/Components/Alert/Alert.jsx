import React from 'react';

const Alert = (props) => {
    const alertType = props.type;
    let message = "";

    if (props.type === "danger") {
        message = "You need to enter a valid address, outlined below!"
    }
    
    return (
        <div className="alert">
            <div style={{ marginBottom: '-1rem' }} class={`alert alert-${alertType}`} role="alert">
                { message }
            </div>
        </div>
    )
}

export default Alert;