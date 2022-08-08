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
import ERC720 from '../Collections/ERC720';
import ERC721 from '../Collections/ERC721';
import ERC1155 from '../Collections/ERC1155';
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
            <Route exact path="/erc720" element={<ERC720 />}></Route>
            <Route exact path="/erc721" element={<ERC721 />}></Route>
            <Route exact path="/erc1155" element={<ERC1155 />}></Route>
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