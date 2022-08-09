import { Home, MintPage } from './pages'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import 'bootstrap/dist/css/bootstrap.css';

function App() {

  return (
    <div className='App'>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mint-page" element={<MintPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
