import React from 'react';
import '../Sidebar/Sidebar.css';

const Sidebar = () => {

    return (
        <div class="container-fluid">
            <div class="row">
                <nav id="sidebarMenu" class="col-md-3 col-lg-2 d-md-block bg-dark sidebar collapse">
                    <div class="sidebar-sticky pt-3">
                        <table class="table table-striped table-dark">
                            <tbody>
                                <tr class="col-sm-3">
                                    <td><img src={require("../../assets/images/dashboard.png")} width="35" height="25" alt="logo" /></td>
                                    <td><a href="#">Dashboard</a></td>
                                </tr>
                                <tr>
                                    <td><img src={require("../../assets/images/transactions.png")} width="35" height="25" alt="logo" /></td>
                                    <td><a href="#">Transactions</a></td>
                                </tr>
                                <tr>
                                    <td><img src={require("../../assets/images/analytics.png")} width="35" height="25" alt="logo" /></td>
                                    <td><a href="#">Analytics</a></td>
                                </tr>
                                <tr>
                                    <td><img src={require("../../assets/images/collections.png")} width="35" height="25" alt="logo" /></td>
                                    <td><a href="#">Collections</a></td>
                                </tr>
                                <tr>
                                    <td><img src={require("../../assets/images/charts.png")} width="35" height="25" alt="logo" /></td>
                                    <td><a href="#">Charts</a></td>
                                </tr>
                                <tr>
                                    <td><img src={require("../../assets/images/about.png")} width="35" height="25" alt="logo" /></td>
                                    <td><a href="#">About</a></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </nav>
            </div>
        </div>
    );
}

export default Sidebar;