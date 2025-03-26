import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import './login.css';
import Particles from "./Particles";

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address.');
            return;
        }
        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Login successful:', data);
                navigate('/dashboard', { state: { token: data.sessionToken } });
            } else {
                console.error('Login failed:', response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleBack = () => {
        navigate('/home');
    };

    return (

        <div className="login-page">
            <Particles
                className="particles-bg"
                disableRotation={true}
                particleCount={300}
                particleSpread={10}
                speed={0.1}
                moveParticlesOnHover={true}
                particleHoverFactor={1}
                alphaParticles={true}
                particleBaseSize={100}
                sizeRandomness={1}
                cameraDistance={20}
            />
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
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                placeholder="Type your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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
