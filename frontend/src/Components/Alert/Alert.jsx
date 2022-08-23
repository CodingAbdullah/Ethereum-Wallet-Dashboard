import React from 'react';

const Alert = (props) => {
    const { type } = props;
    let message = "";

    switch(type) {
        case "danger":
            message = "You need to enter a valid address, outlined below!";
            break;
        case "warning":
            message = "Empty wallet! No assets found!";
            break;
        default:
            break;
    }

    return (
        <div className="alert">
            <div style={{ marginBottom: '-1rem' }} class={`alert alert-${type}`} role="alert">
                { message }
            </div>
        </div>
    )
}

export default Alert;