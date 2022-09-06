import './App.css';
import Navbar from  '../Navbar/Navbar';
import Sidebar from '../Sidebar/Sidebar';
import Home from '../Home/Home';
import Transactions from '../Transactions/Transactions';
import PageNotFound from '../MiscellaneousPages/PageNotFound';
import Footer from '../Footer/Footer';
import About from '../About/About';
import PricesPage from '../PricesPage/PricesPage';
import Collections from '../Collections/Collections';
import ENSPage from '../ENSPage/ENSPage';
import ERC720CollectionPage from '../ERC720CollectionPage/ERC720CollectionPage';
import ERC720Holdings from '../ERC720Holdings/ERC720Holdings';
import ERC720Prices from '../ERC720Prices/ERC720Prices';
import ERC721CollectionPage from '../ERC721CollectionPage/ERC721CollectionPage';
import ERC721Lookups from '../ERC721Lookups/ERC721Lookups';
import ERC721Holdings from '../ERC721Holdings/ERC721Holdings';
import WalletStats from '../WalletStats/WalletStats';
import GenericChartPage from '../GenericChartPage/GenericChartPage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const App = () => {
  return (
    <Router>
      <div className="App">
        <div>
          <Navbar />
        </div>
        <div>
          <Sidebar />
        </div>
        <div> 
          <Routes>
            <Route exact path="/" element={<Home />}></Route>
            <Route exact path="/about" element={<About />}></Route>
            <Route exact path="/transactions" element={<Transactions />}></Route>
            <Route exact path="/prices" element={<PricesPage />}></Route>
            <Route exact path="/collections" element={<Collections />}></Route>
            <Route exact path="/ens-lookup" element={<ENSPage />}></Route>
            <Route exact path="/erc20-holdings" element={<ERC720Holdings />}></Route>
            <Route exact path="/erc20-token-prices" element={<ERC720Prices />}></Route>
            <Route exact path="/erc721-holdings" element={<ERC721Holdings />}></Route>
            <Route exact path="/erc721-lookups" element={<ERC721Lookups />}></Route>
            <Route exact path="/collections/erc720-collection" element={<ERC720CollectionPage />}></Route>
            <Route exact path="/collections/erc721-collection" element={<ERC721CollectionPage />}></Route>
            <Route exact path="/walletAnalytics" element={<WalletStats />}></Route>
            <Route exact path="/chart" element={<GenericChartPage />}></Route>
            <Route exact path="*" element={<PageNotFound />}></Route>
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