import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/home/home';
import './App.css';

const App = () => {
  return (
    <div className="App">
      <Router>
        <Routes>
          {/* Route for the home page */}
          <Route exact path="/" element={<Home />} />
        </Routes>
      </Router>


    </div>
  );
}

export default App;
