import React, { useState, useEffect } from "react";
import './login.css';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        alert("Signing in...")
    };

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div className="login-page">
            {/* Header con navbar */}
            <header className="header">
                <nav className="navbar">
                    <div className="navbar-logo">
                        <h2>Orion</h2>
                    </div>
                    <div className="navbar-buttons">
                        <button className="btn back" onClick={handleBack}>
                            Go Back
                        </button>
                    </div>
                </nav>
            </header>

            <main className="main">
                <div className="login-container">
                    <h2>Login</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                placeholder="Type your email"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                placeholder="Type your password"
                                required
                            />
                        </div>

                        <button type="submit" className="btn login-btn">
                            Sign-in
                        </button>
                    </form>
                </div>
            </main>
            <footer className="footer">
                <p>&copy; 2025 Orion</p>
                <p>Alberto Cazallas Monje</p>
            </footer>
        </div>
    );
}
export default Login;