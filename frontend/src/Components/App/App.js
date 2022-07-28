import './App.css';
import Navbar from  '../Navbar/Navbar';
import Sidebar from '../Sidebar/Sidebar';
import Home from '../Home/Home';
import Transactions from '../Transactions/Transactions';
import BTCChartPage from '../BTCChartPage/BTCChartPage';
import ETHChartPage from '../ETHChartPage/ETHChartPage';
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
            <Route exact path="/btcChart" element={<BTCChartPage />}></Route>
            <Route exact path="/ethChart" element={<ETHChartPage />}></Route>
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