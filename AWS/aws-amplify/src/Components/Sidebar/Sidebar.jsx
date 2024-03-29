import React from 'react';
import '../Sidebar/Sidebar.css';
import SidebarMetricsSection from '../SidebarMetricsSection/SidebarMetricsSection';

const Sidebar = () => {
   
    // Add the child component, SideBarMetricsSection and keep the main Sidebar component lean
    return (
        <nav id="sidebarMenu" class="col-md-3 col-lg-2 d-md-block bg-dark sidebar collapse">
            <SidebarMetricsSection />
            <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom" />
            <div class="sidebar-sticky">
                <table class="table table-striped table-dark">
                    <tbody>
                        <tr>
                            <td><img src={require("../../assets/images/about.png")} width="35" height="30" alt="logo" /></td>
                            <td><a style={{color: 'white'}} href="/about">About</a></td>
                        </tr>
                        <tr>
                            <td><img src={require("../../assets/images/charts.png")} width="35" height="30" alt="logo" /></td>
                            <td><a style={{color: 'white'}} href="/prices">Coin Prices</a></td>
                        </tr>
                        <tr>
                            <td><img src={require("../../assets/images/dashboard.png")} width="35" height="30" alt="logo" /></td>
                            <td><a style={{color: 'white'}} href="/">Dashboard</a></td>
                        </tr>
                        <tr>
                            <td><img src={require("../../assets/images/nft.png")} width="35" height="30" alt="logo" /></td>
                            <td><a style={{color: 'white'}} href="/ens-erc721-selection">ENS/ERC721 Lookups</a></td>
                        </tr>
                        <tr>
                            <td><img src={require("../../assets/images/erc20Token.png")} width="35" height="30" alt="logo" /></td>
                            <td><a style={{color: 'white'}} href="/erc20-holdings">ERC20 Token Holdings</a></td>
                        </tr>
                        <tr>
                            <td><img src={require("../../assets/images/token.png")} width="35" height="30" alt="logo" /></td>
                            <td><a style={{color: 'white'}} href="/erc20-token-prices">ERC20 Token Prices</a></td>
                        </tr>
                        <tr>
                            <td><img src={require("../../assets/images/erc721Holdings.png")} width="35" height="30" alt="logo" /></td>
                            <td><a style={{color: 'white'}} href="/erc721-holdings">ERC721 Token Holdings</a></td>
                        </tr>
                        <tr>
                            <td><img src={require("../../assets/images/l2.png")} width="35" height="30" alt="logo" /></td>
                            <td><a style={{color: 'white'}} href="/ethereum-layer-two-chains">Ethereum Layer 2s</a></td>
                        </tr>
                        <tr>
                            <td><img src={require("../../assets/images/gas.png")} width="35" height="30" alt="logo" /></td>
                            <td><a style={{color: 'white'}} href="/gas-tracker">Gas Station</a></td>
                        </tr>
                        <tr>
                            <td><img src={require("../../assets/images/analytics.png")} width="35" height="30" alt="logo" /></td>
                            <td><a style={{color: 'white'}} href="/analytics-selection">Wallet/Token Analytics</a></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </nav>
    );
}

export default Sidebar;