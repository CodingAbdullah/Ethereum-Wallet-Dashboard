import './App.css';
import Navbar from  '../Navbar/Navbar';
import Sidebar from '../Sidebar/Sidebar';
import Home from '../Home/Home';
import Transactions from '../Transactions/Transactions';
import BTCChartPortal from '../BTCChartPortal/BTCChartPortal';
import ETHChartPortal from '../ETHChartPortal/ETHChartPortal';
import Footer from '../Footer/Footer';
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
            <Route exact path="/transactions" element={<Transactions />}></Route>
            <Route exact path="/btcChart" element={<BTCChartPortal />}></Route>
            <Route exact path="/ethChart" element={<ETHChartPortal />}></Route>
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