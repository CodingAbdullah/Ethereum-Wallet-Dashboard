import React from 'react';

const ENSToAddressInfoTable = (props) => {

    const { data, address } = props;

    return (
            <table style={{marginRight: '15rem'}} class="col-md-9 ml-sm-auto col-lg-10 px-md-4">
                <thead>
                <tr>
                    <th scope="col">Address Resolver</th>
                    <th scope="col">Personal Website</th>
                </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{data.information.results[0].owner}</td>
                        <td><a href={"https://" + address + ".xyz/"} target="_blank" rel="noreferrer">{address} - Link</a></td>
                    </tr>
                </tbody>
            </table>        
    )
}

export default ENSToAddressInfoTable;