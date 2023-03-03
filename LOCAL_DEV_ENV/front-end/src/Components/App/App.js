import './App.css';
import Navbar from  '../Navbar/Navbar';
import Sidebar from '../Sidebar/Sidebar';
import HomePage from '../HomePage/HomePage';
import TransactionsPage from '../TransactionsPage/TransactionsPage';
import PageNotFoundPage from '../PageNotFoundPage/PageNotFoundPage';
import AnalyticsSelectionPage from '../AnalyticsSelectionPage/AnalyticsSelectionPage';
import Footer from '../Footer/Footer';
import AboutPage from '../AboutPage/AboutPage';
import PricesPage from '../PricesPage/PricesPage';
import CollectionsPage from '../CollectionsPage/CollectionsPage';
import GasTrackerPage from '../GasTrackerPage/GasTrackerPage';
import ENSPage from '../ENSPage/ENSPage';
import ENSToAddressResolverPage from '../ENSToAddressResolverPage/ENSToAddressResolverPage';
import AddressToENSResolverPage from '../AddressToENSResolverPage/AddressToENSResolverPage';
import ENSERC721SelectionPage from '../ENSERC721SelectionPage/ENSERC721SelectionPage';
import ENSTransferByIdPage from '../ENSTransferByIdPage/ENSTransferByIdPage';
import ENSTransferByNamePage from '../ENSTransferByNamePage/ENSTransferByNamePage';
import ERC720CollectionPage from '../ERC720CollectionPage/ERC720CollectionPage';
import ERC720HoldingsPage from '../ERC720HoldingsPage/ERC720HoldingsPage';
import ERC720PricesPage from '../ERC720PricesPage/ERC720PricesPage';
import ERC721CollectionPage from '../ERC721CollectionPage/ERC721CollectionPage';
import ERC721LookupsPage from '../ERC721LookupsPage/ERC721LookupsPage';
import ERC721HoldingsPage from '../ERC721HoldingsPage/ERC721HoldingsPage';
import ETHLayerTwoSelectionPage from '../ETHLayerTwoSelectionPage/ETHLayerTwoSelectionPage';
import WalletStatsPage from '../WalletStatsPage/WalletStatsPage';
import GenericChartPage from '../GenericChartPage/GenericChartPage';
import MetricsNavbar from '../MetricsNavbar/MetricsNavbar';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const App = () => {
  return (
    <Router>
      <div className="App">
        <div>
          <Navbar />
        </div>
        <div>
          <MetricsNavbar />
        </div>
        <div> 
          <Routes>
            <Route exact path="/" element={<HomePage />}></Route>
            <Route exact path="/about" element={<AboutPage />}></Route>
            <Route exact path="/analytics-selection" element={<AnalyticsSelectionPage />}></Route>
            <Route exact path="/collections" element={<CollectionsPage />}></Route>
            <Route exact path="/collections/erc720-collection" element={<ERC720CollectionPage />}></Route>
            <Route exact path="/collections/erc721-collection" element={<ERC721CollectionPage />}></Route>
            <Route exact path="/chart" element={<GenericChartPage />}></Route>
            <Route exact path="/ens-lookup" element={<ENSPage />}></Route>
            <Route exact path="/ens-erc721-selection" element={<ENSERC721SelectionPage />}></Route>
            <Route exact path="/ens-lookup/address-to-ens-lookup" element={<AddressToENSResolverPage />}></Route>
            <Route exact path="/ens-lookup/ens-to-address-lookup" element={<ENSToAddressResolverPage />}></Route>
            <Route exact path="/ens-lookup/ens-transfers-by-id" element={<ENSTransferByIdPage />}></Route>
            <Route exact path="/ens-lookup/ens-transfers-by-name" element={<ENSTransferByNamePage />}></Route>
            <Route exact path="/erc20-holdings" element={<ERC720HoldingsPage />}></Route>
            <Route exact path="/erc20-token-prices" element={<ERC720PricesPage />}></Route>
            <Route exact path="/erc721-holdings" element={<ERC721HoldingsPage />}></Route>
            <Route exact path="/erc721-lookups" element={<ERC721LookupsPage />}></Route>
            <Route exact path="/ethereum-layer-two-chains" element={<ETHLayerTwoSelectionPage />}></Route>
            <Route exact path="/gas-tracker" element={<GasTrackerPage />}></Route>
            <Route exact path="/prices" element={<PricesPage />}></Route>
            <Route exact path="/transactions" element={<TransactionsPage />}></Route>
            <Route exact path="/walletAnalytics" element={<WalletStatsPage />}></Route>
            <Route exact path="*" element={<PageNotFoundPage />}></Route>
          </Routes>
        </div>
        <div>
          <Footer />
        </div>
      </div>
    </Router>
  );
}

export default App;