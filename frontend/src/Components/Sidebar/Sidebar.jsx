import React from 'react';
import '../Sidebar/Sidebar.css';

const Sidebar = () => {

    return (
        <nav id="sidebarMenu" class="col-md-3 col-lg-2 d-md-block bg-dark sidebar collapse">
            <div class="sidebar-sticky pt-3">
                <table class="table table-striped table-dark">
                    <tbody>
                        <tr class="col-sm-3">
                            <td><img src={require("../../assets/images/dashboard.png")} width="35" height="30" alt="logo" /></td>
                            <td><a href="/">Dashboard</a></td>
                        </tr>
                        <tr>
                            <td><img src={require("../../assets/images/analytics.png")} width="35" height="30" alt="logo" /></td>
                            <td><a href="/walletAnalytics">Wallet Analytics</a></td>
                        </tr>
                        <tr>
                            <td><img src={require("../../assets/images/collections.png")} width="35" height="30" alt="logo" /></td>
                            <td><a href="/collections">Collections</a></td>
                         </tr>
                        <tr>
                            <td><img src={require("../../assets/images/charts.png")} width="35" height="30" alt="logo" /></td>
                            <td><a href="/prices">Coin Prices</a></td>
                        </tr>
                        <tr>
                            <td><img src={require("../../assets/images/token.png")} width="35" height="30" alt="logo" /></td>
                            <td><a href="/erc20-token-prices">ERC20 Token Prices</a></td>
                        </tr>
                        <tr>
                            <td><img src={require("../../assets/images/erc20Token.png")} width="35" height="30" alt="logo" /></td>
                            <td><a href="/erc20-holdings">ERC20 Token Holdings</a></td>
                        </tr>
                        <tr>
                            <td><img src={require("../../assets/images/nft.png")} width="35" height="30" alt="logo" /></td>
                            <td><a href="/erc721-lookups">ERC721 Token Lookups</a></td>
                        </tr>
                        <tr>
                            <td><img src={require("../../assets/images/erc721Holdings.png")} width="35" height="30" alt="logo" /></td>
                            <td><a href="/erc721-holdings">ERC721 Token Holdings</a></td>
                        </tr>
                        <tr>
                            <td><img src={require("../../assets/images/ensTwo.png")} width="35" height="30" alt="logo" /></td>
                            <td><a href="/ens-lookup">ENS Lookups</a></td>
                        </tr>
                        <tr>
                            <td><img src={require("../../assets/images/about.png")} width="35" height="30" alt="logo" /></td>
                            <td><a href="/about">About</a></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </nav>
    );
}

export default Sidebar;