import React, { useState, useEffect } from "react";
import './dashboard.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { GoArrowSwitch, GoCreditCard, GoPlus } from "react-icons/go";
import CountUp from './CountUp';
import SpotlightCard from './SpotlightCard';

const Dashboard = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const sessionToken = state?.token;

    const [userData, setUserData] = useState(null);
    const [userName, setUserName] = useState("");
    const [balance, setBalance] = useState(0);
    const [showTopUpField, setShowTopUpField] = useState(false);
    const [topUpAmount, setTopUpAmount] = useState("");

    useEffect(() => {
        const fetchAccountData = async () => {
            try {
                const actionResponse = await fetch('http://localhost:3000/action', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sessionToken: sessionToken,
                        actionCode: "FIND-USER"
                    })
                });
                if (!actionResponse.ok) throw new Error('Error en la solicitud del token de acción.');
                const actionData = await actionResponse.json();
                const actionToken = actionData.actionToken;

                const findResponse = await fetch('http://localhost:3002/find', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sessionToken: sessionToken,
                        actionToken: actionToken
                    })
                });
                if (!findResponse.ok) throw new Error('Error en la consulta de la cuenta.');
                const accountData = await findResponse.json();
                console.log("Datos de la cuenta:", accountData);
    
                setUserData(accountData);

                setBalance(accountData.b_balance || 0);
            } catch (error) {
                console.error("Error fetching account data:", error);
            }
        };

        if (sessionToken) {
            fetchAccountData();
        }
    }, [sessionToken]);

    useEffect(() => {
        const loadUserData = async () => {
          try {
            const actionResponse = await fetch('http://localhost:3000/action', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sessionToken: sessionToken,
                actionCode: "FIND-USER"
              })
            });
            if (!actionResponse.ok) throw new Error('Error fetching user action token.');
            const actionData = await actionResponse.json();
            const actionToken = actionData.actionToken;
    
            const userResponse = await fetch('http://localhost:3000/findUser', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sessionToken: sessionToken,
                actionToken: actionToken
              })
            });
            if (!userResponse.ok) throw new Error('Error fetching user data.');
            const userData = await userResponse.json();
            console.log("Datos del usuario:", userData);
            setUserName(userData.u_name || "User");
          } catch (error) {
            console.error("Error loading user data:", error);
          }
        };
    
        if (sessionToken) {
          loadUserData();
        }
      }, [sessionToken]);

      const handleLogout = async () => {
        try {
            const response = await fetch('http://localhost:3000/logout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionToken: sessionToken })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Logout failed");
            }
            navigate("/login");
        } catch (error) {
            console.error("Error during logout:", error);
            alert("Error during logout: " + error.message);
        }
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
            if (!actionResponse.ok) throw new Error('Error en la solicitud del token de acción.');
            const actionData = await actionResponse.json();
            const actionToken = actionData.actionToken;
            navigate("/update", { state: { sessionToken, actionToken } });
        } catch (error) {
            console.error('Error al obtener los datos del usuario:', error);
        }
    };

    const toggleTopUpField = () => {
        setShowTopUpField(prev => !prev);
        setTopUpAmount("");
    };

    const handleTopUpSubmit = async (e) => {
        e.preventDefault();
        if (!topUpAmount || isNaN(topUpAmount) || Number(topUpAmount) <= 0) {
            alert("Please enter a valid top-up amount.");
            return;
        }
        try {
            const actionResponse = await fetch('http://localhost:3000/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionToken: sessionToken,
                    actionCode: "ADD-TOP-UP"
                })
            });
            if (!actionResponse.ok) throw new Error('Error requesting top-up action token.');
            const actionData = await actionResponse.json();
            const actionToken = actionData.actionToken;
    
            const topUpResponse = await fetch('http://localhost:3002/topUp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionToken: sessionToken,
                    actionToken: actionToken,
                    quantity: parseFloat(topUpAmount)
                })
            });
            if (!topUpResponse.ok) {
                const errorData = await topUpResponse.json();
                alert("Error while adding top-up: " + errorData.message);
            } else {
                alert("Top-up added successfully.");
                setShowTopUpField(false);
                setBalance(prev => prev + parseFloat(topUpAmount));
                setTopUpAmount("");
            }
        } catch (error) {
            console.error("Error while processing top-up:", error);
            alert("Error while processing top-up.");
        }
    };

    const handleCreateCard = async () => {
        try {
            const actionResponse = await fetch('http://localhost:3000/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionToken: sessionToken,
                    actionCode: "CREATE-CARD"
                })
            });
            if (!actionResponse.ok) throw new Error('Error requesting create card action token.');
            const actionData = await actionResponse.json();
            const actionToken = actionData.actionToken;
    
            const createCardResponse = await fetch('http://localhost:3002/createCard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionToken: sessionToken,
                    actionToken: actionToken
                })
            });
            if (!createCardResponse.ok) {
                const errorData = await createCardResponse.json();
                alert("Error while creating card: " + errorData.message);
            } else {
                alert("Credit card created successfully.");
            }
        } catch (error) {
            console.error("Error while creating card:", error);
            alert("Error while creating card.");
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
                        <button className="btn logout" onClick={handleLogout}>Logout</button>
                        <button className="btn profile" onClick={handleProfile}>User Profile</button>
                    </div>
                </nav>
            </header>
            <main>
                <div className="banner">
                    <h1>Welcome to your Dashboard</h1>
                    <h2>{userName|| "User"}</h2>
                </div>
                <section className="features">
                    <h2>Balance:</h2>
                    <CountUp
                        from={0}
                        to={balance}
                        duration={0.25}
                        separator=","
                        className="count-up-text"
                    />
                    <span> €</span>
                </section>
                <div className="button-container">
                    <button className="glassy-button" onClick={toggleTopUpField}>
                        <GoPlus size={24} />
                    </button>
                    <button className="glassy-button">
                        <GoArrowSwitch size={24} />
                    </button>
                    <button className="glassy-button" onClick={handleCreateCard}>
                        <GoCreditCard size={24} />
                    </button>
                </div>
                {showTopUpField && (
                    <div className="top-up-wrapper">
                        <SpotlightCard className="custom-spotlight-card" spotlightColor="rgba(125, 36, 199, 0.81)">
                            <form onSubmit={handleTopUpSubmit} className="top-up-form">
                                <h2>Top-Up</h2>
                                <label htmlFor="amount">Amount:</label>
                                <input
                                    id="amount"
                                    type="number"
                                    value={topUpAmount}
                                    onChange={(e) => setTopUpAmount(e.target.value)}
                                    placeholder="Amount"
                                    required
                                    className="top-up-input"
                                />
                                <span>€</span>
                                <div className="button-row">
                                    <button type="submit" className="btn glassy-button">
                                        Submit
                                    </button>
                                    <button type="button" className="btn glassy-button" onClick={toggleTopUpField}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </SpotlightCard>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
