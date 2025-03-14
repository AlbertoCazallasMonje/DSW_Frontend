import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/home/home';
import './App.css';
import Login from "./components/login/login";
import Register from "./components/register/register";
import UpdateUser from "./components/update/updateUser";

const App = () => {
  return (
    <div className="App">
      <Router>
        <Routes>
          {/* Route for the home page + Login + Register */}
          <Route exact path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/update" element={<UpdateUser />} />

            {/* Redirect to '/' if page does not exist */}
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
