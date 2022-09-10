import React from 'react';


const AddressToENSInfoTable = (props) => {
    const { data } = props;

    return (
            <table class="col-md-9 ml-sm-auto col-lg-10 px-md-4">
                <thead>
                <tr>
                    <th scope="col">ENS Resolver</th>
                    <th scope="col">Personal Website</th>
                </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{data.name}</td>
                        <td><a href={"https://" + data.name + ".xyz/"} target="_blank" rel="noreferrer">{data.name} - Link</a></td>
                    </tr>
                </tbody>
            </table>        
    )
}


export default AddressToENSInfoTable;