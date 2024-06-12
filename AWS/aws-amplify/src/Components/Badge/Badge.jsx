import React from 'react';

// Creating a custom badge to be used for representing direction
const Badge = (props) => {
    const { type } = props;
    let message = "";

    switch (type) {
        case "IN":
            message = "IN";
            break;
        case "OUT":
            message = "OUT";
            break;
        default:
            break;
    }

    return (
        <div className='custom-badge'>
            {
                type === 'IN' ? <span class='badge rounded-pill text-bg-success'>{message}</span> :
                <span class='badge rounded-pill text-bg-warning'>{message}</span>
            }
        </div>
    )
}

export default Badge;