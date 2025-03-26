import React, { useState, useEffect } from "react";
import './dashboard.css';
import { useLocation, useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const sessionToken = state?.token;

    const handleLogout = () => {
        navigate("/login");
    };

    const handleProfile = async (e) => {
        e.preventDefault();
        try {
            const actionResponse = await fetch('http://localhost:3000/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionToken: sessionToken,
                    actionCode: "FIND-USER"
                })
            });
            if (!actionResponse.ok) {
                throw new Error('Error en la llamada a /action');
            }
            const actionData = await actionResponse.json();
            const actionToken = actionData.actionToken;

            navigate("/update", { state: { sessionToken, actionToken } });
        } catch (error) {
            console.error('Error al obtener los datos del usuario:', error);
        }
    };

    return (
        <div className="dashboard-page">
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
