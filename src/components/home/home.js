import React, { useState, useEffect } from "react";
import './home.css';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    const handleRegister = () => {
        navigate('/register');
    }

    const handleLogin = () => {
        navigate('/login');
    }

    return (
        <div className="landing-page">
            <header className="header">
                <nav className="navbar">
                    <div className="navbar-logo">
                        <h2>Orion</h2>
                    </div>
                    <div className="navbar-buttons">
                        <button className="btn register" onClick={handleRegister}>
                            Sign-up
                        </button>
                        <button className="btn login" onClick={handleLogin}>
                            Sign-in
                        </button>
                    </div>
                </nav>
            </header>
            <main>
                <div className="banner">
                    <h1>Welcome to Orion</h1>
                    <p>The safest and easier way to transfer money between users</p>
                </div>
                <section className="features">
                    <h2>Characteristics</h2>
                    <p>
                        Find all the functionalities of our platform to perform safe and fast
                        transactions
                    </p>
                </section>
            </main>
            <footer className="footer">
                <p>&copy; 2025 Orion</p>
                <p>Alberto Cazallas Monje</p>
            </footer>
        </div>
    );
}
export default Home;