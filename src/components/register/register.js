import React, { useState, useEffect } from "react";
import './register.css';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        alert('Registrando usuario...');
    };

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div className="registro-page">
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
                <div className="registro-container">
                    <h2>Register</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="nombre">Name</label>
                            <input
                                type="text"
                                id="nombre"
                                placeholder="Type your First Name"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="apellidos">Last Name</label>
                            <input
                                type="text"
                                id="apellidos"
                                placeholder="Type your Last Name"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="dni">DNI</label>
                            <input
                                type="text"
                                id="dni"
                                placeholder="Type your DNI"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                placeholder="Type your Email"
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
                        <button type="submit" className="btn register-btn">
                            Sign-up
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
export default Register;