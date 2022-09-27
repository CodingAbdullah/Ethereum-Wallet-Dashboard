import React from 'react';

const Alert = (props) => {
    let { type } = props;
    let message = "";

    switch(type) {
        case "danger":
            message = "You need to enter a valid address!";
            break;
        case "warning":
            message = "Empty wallet! No assets/transactions found!";
            break;
        case "warning-empty-internal":
            message = "No internal transactions found!";
            type = "warning";
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