import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Particles from "./Particles";
import './reset.css';

const Reset = () => {

  const { actionToken } = useParams();
  const navigate = useNavigate();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);


  const validatePasswords = () => {
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return false;
    }
    if (!isValidPassword(newPassword)) {
      setError("Password must contain at least one uppercase, one number and a special character.");
      return false;
    }
    return true;
  };

  const isValidPassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(password);
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!validatePasswords()) return;

    try {
      const response = await fetch(`/passwordUpdate/${actionToken}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword })
      });

      if (response.ok) {
        setMessage("Password successfully updated. Redirecting to login...");
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        const data = await response.json();
        setError(data.error || "Error updating password.");
      }
    } catch (err) {
      setError("Error communicating with the server.");
    }
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
        </nav>
      </header>
      <main className="main">
        <div className="login-container">
          <h2>Reset Password</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="newPassword">New password</label>
              <input
                type="password"
                id="newPassword"
                placeholder="Introduce your new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm new password</label>
              <input
                type="password"
                id="confirmPassword"
                placeholder="Confirm the new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="error">{error}</p>}
            {message && <p className="message">{message}</p>}
            <button type="submit" className="btn login-btn">
              Change password
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
};

export default Reset;
