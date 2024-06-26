import './App.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import store from '../../redux/store/store';
import Navbar from  '../Navbar/Navbar';
import HomePage from '../HomePage/HomePage';
import TransactionsPage from '../TransactionsPage/TransactionsPage';
import PageNotFoundPage from '../PageNotFoundPage/PageNotFoundPage';
import Footer from '../Footer/Footer';
import AboutPage from '../AboutPage/AboutPage';
import PricesPage from '../PricesPage/PricesPage';
import CollectionsPage from '../CollectionsPage/CollectionsPage';
import GasTrackerPage from '../GasTrackerPage/GasTrackerPage';
import ENSPage from '../ENSPage/ENSPage';
import ENSToAddressResolverPage from '../ENSToAddressResolverPage/ENSToAddressResolverPage';
import AddressToENSResolverPage from '../AddressToENSResolverPage/AddressToENSResolverPage';
import ENSTransferByIdPage from '../ENSTransferByIdPage/ENSTransferByIdPage';
import ENSTransferByNamePage from '../ENSTransferByNamePage/ENSTransferByNamePage';
import ERC720CollectionPage from '../ERC720CollectionPage/ERC720CollectionPage';
import ERC720HoldingsPage from '../ERC720HoldingsPage/ERC720HoldingsPage';
import ERC720PricesPage from '../ERC720PricesPage/ERC720PricesPage';
import ERC721CollectionPage from '../ERC721CollectionPage/ERC721CollectionPage';
import ERC721LookupsPage from '../ERC721LookupsPage/ERC721LookupsPage';
import ERC721HoldingsPage from '../ERC721HoldingsPage/ERC721HoldingsPage';
import WalletStatsPage from '../WalletStatsPage/WalletStatsPage';
import GenericChartPage from '../GenericChartPage/GenericChartPage';
import MetricsNavbar from '../MetricsNavbar/MetricsNavbar';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import OptimismPricePage from '../OptimismPricePage/OptimismPricePage';
import MaticPricePage from '../MaticPricePage/MaticPricePage';
import ArbitrumPricePage from '../ArbitrumPricePage/ArbitrumPricePage';

const App = () => {
  let queryClient = new QueryClient(); // Pass in Queryclient to be used anywhere in app

  return (
    <Provider store={ store }>
      <QueryClientProvider client={ queryClient }>
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
                <Route exact path="/collections" element={<CollectionsPage />}></Route>
                <Route exact path="/collections/erc720-collection" element={<ERC720CollectionPage />}></Route>
                <Route exact path="/collections/erc721-collection" element={<ERC721CollectionPage />}></Route>
                <Route exact path="/chart" element={<GenericChartPage />}></Route>
                <Route exact path="/ens-lookup" element={<ENSPage />}></Route>
                <Route exact path="/ens-lookup/address-to-ens-lookup" element={<AddressToENSResolverPage />}></Route>
                <Route exact path="/ens-lookup/ens-to-address-lookup" element={<ENSToAddressResolverPage />}></Route>
                <Route exact path="/ens-lookup/ens-transfers-by-id" element={<ENSTransferByIdPage />}></Route>
                <Route exact path="/ens-lookup/ens-transfers-by-name" element={<ENSTransferByNamePage />}></Route>
                <Route exact path="/erc20-holdings" element={<ERC720HoldingsPage />}></Route>
                <Route exact path="/erc20-token-prices" element={<ERC720PricesPage />}></Route>
                <Route exact path="/erc721-holdings" element={<ERC721HoldingsPage />}></Route>
                <Route exact path="/erc721-lookups" element={<ERC721LookupsPage />}></Route>
                <Route exact path="/gas-tracker" element={<GasTrackerPage />}></Route>
                <Route exact path="/prices" element={<PricesPage />}></Route>
                <Route exact path="/prices/arbitrum" element={<ArbitrumPricePage />}></Route>
                <Route exact path="/prices/optimism" element={<OptimismPricePage />}></Route>
                <Route exact path="/prices/matic" element={<MaticPricePage />}></Route>
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
      </QueryClientProvider>
    </Provider>
  );
}

export default App;