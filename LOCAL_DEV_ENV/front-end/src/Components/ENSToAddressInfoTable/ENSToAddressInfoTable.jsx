import React from 'react';

const ENSToAddressInfoTable = (props) => {

    const { data, address } = props;

    return (
        <div style={{ marginTop: '2rem', overflowX: 'scroll', paddingBottom: '2rem' }}>
            <table style={{marginRight: '15rem'}} class="col-md-9 ml-sm-auto col-lg-10 px-md-4">
                <thead>
                <tr>
                    <th scope="col">Address Resolver</th>
                    <th style={{ paddingLeft: '3rem' }}  scope="col">Personal Website</th>
                </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style={{ paddingLeft: '3rem' }} >{data.information.results[0].owner}</td>
                        <td style={{ paddingLeft: '3rem' }} ><a href={"https://" + address + ".xyz/"} target="_blank" rel="noreferrer">{address} - Link</a></td>
                    </tr>
                </tbody>
            </table>  
        </div>      
    )
}

export default ENSToAddressInfoTable;