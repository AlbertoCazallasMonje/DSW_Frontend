import React, { useState, useEffect } from "react";
import './updateUser.css';
import { countries } from '../utils/countries';
import { useLocation, useNavigate } from 'react-router-dom';

const UpdateProfile = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const sessionToken = state?.sessionToken;
    const actionToken = state?.actionToken;
    const [dni, setDni] = useState("");
    const [name, setName] = useState("");
    const [lastName, setLastName] = useState("");
    const [age, setAge] = useState("");
    const [address, setAddress] = useState("");
    const [country, setCountry] = useState("");
    const [email, setEmail] = useState("");

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userResponse = await fetch('http://localhost:3000/findUser', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sessionToken: sessionToken,
                        actionToken: actionToken
                    })
                });
                if (!userResponse.ok) {
                    throw new Error('Error en la llamada a /findUser');
                }
                const userData = await userResponse.json();
                setDni(userData.u_dni);
                setName(userData.u_name);
                setLastName(userData.u_lastName);
                setAge(userData.u_age);
                setEmail(userData.u_email);
                setAddress(userData.u_address);
                setCountry(userData.u_country);
            } catch (error) {
                console.error("Error while retrieving user data:", error);
                alert("Error while retrieving user data");
            }
        };
    
        fetchUserData();
    }, [sessionToken, actionToken]);

    const isValidEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };
    const handleSubmit = async (event) => {
        event.preventDefault();
    
        if (!isValidEmail(email)) {
            alert("Please, introduce a valid email format.");
            return;
        }
    
        try {

            const token = sessionToken;
    
            const actionResponse = await fetch('http://localhost:3000/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionToken: token,
                    actionCode: "UPDATE-USER"
                })
            });
    
            if (!actionResponse.ok) {
                throw new Error('Error requesting update user token');
            }
    
            const actionData = await actionResponse.json();
            const actionToken = actionData.actionToken;

            const payload = {
                token: token,
                actionToken: actionToken,
                dni: dni,
                name: name,
                lastName: lastName,
                age: parseInt(age, 10),
                email: email,
                address: address,
                country: country
            };
    
            const response = await fetch('http://localhost:3000/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
    
            if (response.ok) {
                alert("Data updated successfully.");
                navigate("/dashboard", { state: { token: sessionToken } });
            } else {
                const errorData = await response.json();
                alert("Error while updating user data: " + errorData.message);
            }
        } catch (error) {
            console.error("Error while updating user data", error);
            alert("Error while updating user data.");
        }
    };

    const handleDeleteAccount = async () => {
        const confirmation = prompt("To delete your account, type 'DELETE ACCOUNT'");
        if (confirmation === "DELETE ACCOUNT") {
            try {
                const token = localStorage.getItem("token");

                const response = await fetch("/deleteAccount", {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    alert("Account deleted successfully.");
                    navigate("/");
                } else {
                    const errorData = await response.json();
                    alert("Error while deleting the account: " + errorData.message);
                }

            } catch (error) {
                console.error("Error while deleting the account", error);
                alert("Error while deleting the account.");
            }
        } else {
            alert("The introduced phrase is incorrect.");
        }
    };

    const handleCancel = () => {
        navigate('/dashboard', { state: { token: sessionToken } });
    };

    return (
        <div className="update-page">
            <div className="gradient-background">
                <div className="gradient-left"></div>
                <div className="gradient-right"></div>
            </div>
            <header className="header">
                <nav className="navbar">
                    <div className="navbar-logo">
                        <h2>Orion</h2>
                    </div>
                    <div className="navbar-buttons">
                        <button className="btn back" onClick={handleCancel}>
                            Go Back
                        </button>
                    </div>
                </nav>
            </header>

            <main className="main">
                <div className="update-container">
                    <h2>Update User Profile</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="dni">DNI</label>
                            <input
                                type="text"
                                id="dni"
                                placeholder="DNI"
                                required
                                value={dni}
                                disabled
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="name">Name</label>
                            <input
                                type="text"
                                id="name"
                                placeholder="Type your name"
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
                                placeholder="Type your last name"
                                required
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="age">Age</label>
                            <input
                                type="number"
                                id="age"
                                placeholder="Type your age"
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
                                placeholder="Type your address"
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
                                <option value="">Select your country</option>
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
                                placeholder="Type your email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="button-group">
                            <button type="submit" className="btn update-btn">
                                Accept
                            </button>
                            <button type="button" className="btn delete-btn" onClick={handleDeleteAccount}>
                                Delete Account
                            </button>
                            <button type="button" className="btn cancel-btn" onClick={handleCancel}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default UpdateProfile;
