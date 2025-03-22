import React, { useState, useEffect } from "react";
import './dashboard.css';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate("/login");
    };

    const handleProfile = () => {
        navigate("/update");
    };

    return (
        <div className="dashboard-page">
            <header className="header">
                <nav className="navbar">
                    <div className="navbar-logo">
                        <h2>Orion</h2>
                    </div>
                    <div className="navbar-buttons">
                        <button className="btn logout" onClick={handleLogout}>
                            Logout
                        </button>
                        <button className="btn profile" onClick={handleProfile}>
                            User Profile
                        </button>
                    </div>
                </nav>
            </header>
            <main>
                <div className="banner">
                    <h1>Welcome to the Dashboard</h1>
                    <p>Here, you will be able to handle your transactions and money</p>
                </div>
                <section className="features">
                    <h2>Dashboard Section</h2>
                    <p>
                        On progress...
                    </p>
                </section>
            </main>
        </div>
    );
};

export default Dashboard;
