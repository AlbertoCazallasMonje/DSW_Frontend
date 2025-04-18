import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Particles from "./Particles";
import './recovery.css';

const PasswordRecovery = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }
    try {
      const response = await fetch('/action/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, actionCode: 'RENEW-PASSWORD' })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Recovery token generated:', data);
        setMessage('Recovery email sent. Please check your inbox.');
      } else {
        console.error('Failed to generate token:', response.statusText);
        setMessage('Error generating recovery token.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error generating recovery token.');
    }
  };

  const handleBack = () => {
    navigate('/login');
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
          <h2>Password Recovery</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Enter your email</label>
              <input
                type="email"
                id="email"
                placeholder="Type your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn login-btn">
              Submit
            </button>
          </form>
          {message && <p>{message}</p>}
        </div>
      </main>
      <footer className="footer">
        <p>&copy; 2025 Orion</p>
        <p>Alberto Cazallas Monje</p>
      </footer>
    </div>
  );
};

export default PasswordRecovery;
