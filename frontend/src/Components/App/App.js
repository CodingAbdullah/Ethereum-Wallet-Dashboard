import './App.css';
import Navbar from  '../Navbar/Navbar';
import Sidebar from '../Sidebar/Sidebar';
import Home from '../Home/Home';
import Footer from '../Footer/Footer';

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
        <Home />
      </div>
      <div>
        <Footer />
      </div>
    </div>
  );
}

export default App;
