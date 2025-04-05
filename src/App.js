import React from 'react';
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import Home from './components/home/home';
import './App.css';
import Login from "./components/login/login";
import Register from "./components/register/register";
import UpdateUser from "./components/update/updateUser";
import Dashboard from "./components/dashboard/dashboard";
import Recovery from "./components/recovery/recovery";
import Reset from "./components/reset/reset";

const App = () => {
    return (
        <div className="App">
            <Router>
                <Routes>
                    {/* Route for the home page + Login + Register */}
                    <Route exact path="/" element={<Home/>}/>
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/register" element={<Register/>}/>
                    <Route path="/update" element={<UpdateUser/>}/>
                    <Route path="/dashboard" element={<Dashboard/>}/>
                    <Route path="/recovery" element={<Recovery/>}/>
                    <Route path="/reset/:actionToken" element={<Reset/>}/>

                    {/* Redirect to '/' if page does not exist */}
                    <Route path="*" element={<Navigate to="/"/>}/>
                </Routes>
            </Router>
        </div>
    );
}

export default App;
