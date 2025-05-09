import React, { useState, useEffect } from "react";
import './register.css';
import { countries } from '../utils/countries';
import { useNavigate } from 'react-router-dom';
import Particles from "./Particles";

const Register = () => {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [lastName, setLastName] = useState("");
    const [dni, setDni] = useState("");
    const [age, setAge] = useState("");
    const [address, setAddress] = useState("");
    const [country, setCountry] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!isValidEmail(email)) {
            alert("Please, introduce a valid Email.");
            return;
        }
        if (!isValidPassword(password)) {
            alert("The password must be 8 characters long, include one uppercase and one special character.");
            return;
        }
    
        const payload = {
            dni,
            name: name,
            lastName: lastName,
            age: parseInt(age, 10),
            email,
            password,
            address,
            country
        };
    
        try {
            const response = await fetch("/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
    
            if (response.ok) {
                alert("User registered successfully.");
    
                const bankAccountPayload = {
                    dni: dni,
                    country: country
                };
                
                const bankResponse = await fetch("/accounts/create", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(bankAccountPayload)
                });
    
                if (!bankResponse.ok) {
                    const errorData = await bankResponse.json();
                    alert("Error while creating bank account: " + errorData.message);
                    return;
                }
    
                alert("Bank account created successfully.");
                navigate('/login');
            } else {
                const errorData = await response.json();
                alert("Error while registering a new user: " + errorData.message);
            }
        } catch (error) {
            console.error("Error while registering a new user:", error);
            alert("Error while registering a new user.");
        }
    };

    const isValidEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const isValidPassword = (password) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        return regex.test(password);
    };
    const handleBack = () => {
        navigate('/home');
    };

    return (
        <div className="registro-page">
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
                <div className="registro-container">
                    <h2>Register</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name">Name</label>
                            <input
                                type="text"
                                id="name"
                                placeholder="Type your First Name"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="lastName">Last Name</label>
                            <input
                                type="text"
                                id="lastName"
                                placeholder="Type your Last Name"
                                required
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="dni">DNI</label>
                            <input
                                type="text"
                                id="dni"
                                placeholder="Type your DNI"
                                required
                                value={dni}
                                onChange={(e) => setDni(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="age">Age</label>
                            <input
                                type="number"
                                id="age"
                                placeholder="Type your Age"
                                required
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="address">Address</label>
                            <input
                                type="text"
                                id="address"
                                placeholder="Type your Address"
                                required
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="country">Country</label>
                            <select
                                id="country"
                                required
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                            >
                                <option value="">Select a country</option>
                                {countries.map((c) => (
                                    <option key={c.code} value={c.code}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                placeholder="Type your Email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                placeholder="Type your password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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