import './App.css';
import Navbar from  '../Navbar/Navbar';
import Sidebar from '../Sidebar/Sidebar';
import Home from '../Home/Home';
import Footer from '../Footer/Footer';
import APITest from '../APITest/test';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const App = () => {
  return (
    <div className="App">
      <div>
        <Navbar />
      </div>
      <div>
        <Sidebar />
      </div>
      <div>
        <Router>
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route exact path="/transactions" element={<APITest />} />
          </Routes>
        </Router>
      </div>
      <div>
        <Home />
      </div>
      <div>
        <Footer />
      </div>
    </div>
  );
}

export default App;
