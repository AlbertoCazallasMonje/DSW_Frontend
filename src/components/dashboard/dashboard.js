import React, { useState, useEffect, useRef } from "react";
import './dashboard.css';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    GoArrowSwitch,
    GoCreditCard,
    GoPlus,
    GoRead,
    GoTriangleDown,
    GoTriangleUp,
    GoPeople
} from "react-icons/go";
import CountUp from './CountUp';
import SpotlightCard from './SpotlightCard';
import AnimatedList from './AnimatedList';

const Dashboard = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const sessionToken = state?.token;

    const [userData, setUserData] = useState(null);
    const [userName, setUserName] = useState("");
    const [balance, setBalance] = useState(0);
    const [activeSpotlight, setActiveSpotlight] = useState(null);

    const [topUpAmount, setTopUpAmount] = useState("");
    const [userCards, setUserCards] = useState([]);
    const [selectedCard, setSelectedCard] = useState(null);

    const [creditCardNumber, setCreditCardNumber] = useState("");
    const [creditCardExpirationDate, setCreditCardExpirationDate] = useState("");
    const [creditCardCVV, setCreditCardCVV] = useState("");

    const [transactionEmail, setTransactionEmail] = useState("");
    const [transactionAmount, setTransactionAmount] = useState("");

    const [requestMoneyEmail, setRequestMoneyEmail] = useState("");
    const [requestMoneyAmount, setRequestMoneyAmount] = useState("");
    const [requestMoneyMessage, setRequestMoneyMessage] = useState("");

    // New state for bulk transactions
    const [bulkEmailInput, setBulkEmailInput] = useState("");
    const [bulkEmails, setBulkEmails] = useState([]);
    const [bulkAmount, setBulkAmount] = useState("");

    const [pendingRequests, setPendingRequests] = useState([]);
    const [loadingPending, setLoadingPending] = useState(false);
    const [showPendingRequests, setShowPendingRequests] = useState(false);

    const pendingRef = useRef(null);

    useEffect(() => {
        if (!sessionToken) return;
        const fetchData = async () => {
            try {
                const actionRes = await fetch('http://localhost:3000/action', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionToken, actionCode: "FIND-USER" })
                });
                if (!actionRes.ok) throw new Error('Error requesting action token.');
                const { actionToken } = await actionRes.json();
                const findRes = await fetch('http://localhost:3002/find', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionToken, actionToken })
                });
                if (!findRes.ok) throw new Error('Error fetching account data.');
                const accountData = await findRes.json();
                setUserData(accountData);
                setBalance(accountData.b_balance || 0);
            } catch (error) {
                console.error("Error fetching account data:", error);
            }
            try {
                const userActRes = await fetch('http://localhost:3000/action', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionToken, actionCode: "FIND-USER" })
                });
                if (!userActRes.ok) throw new Error('Error requesting user token.');
                const { actionToken: userActToken } = await userActRes.json();
                const userRes = await fetch('http://localhost:3000/findUser', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionToken, actionToken: userActToken })
                });
                if (!userRes.ok) throw new Error('Error fetching user data.');
                const userData = await userRes.json();
                setUserName(userData.u_name || "User");
            } catch (error) {
                console.error("Error loading user data:", error);
            }
        };
        fetchData();
    }, [sessionToken]);

    useEffect(() => {
        if (showPendingRequests && pendingRef.current) {
            pendingRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [showPendingRequests]);

    const loadPendingRequests = async () => {
        if (loadingPending) return;
        setLoadingPending(true);
        try {
            const actionRes = await fetch('http://localhost:3000/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionToken, actionCode: "LOAD-TRANSACTIONS" })
            });
            if (!actionRes.ok) throw new Error('Error requesting transactions token.');
            const { actionToken } = await actionRes.json();
            const pendingRes = await fetch('http://localhost:3002/loadPendingTransactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionToken, actionToken })
            });
            if (!pendingRes.ok) {
                const errorData = await pendingRes.json();
                throw new Error(errorData.message || "Error loading pending transactions.");
            }
            const transactions = await pendingRes.json();
            setPendingRequests(transactions.transactions || []);
        } catch (error) {
            console.error("Error loading pending transactions:", error);
            alert("Error loading pending transactions: " + error.message);
        } finally {
            setLoadingPending(false);
        }
    };

    const togglePendingRequests = () => {
        if (!showPendingRequests) {
            loadPendingRequests();
        }
        setShowPendingRequests(prev => !prev);
    };

    const handleLogout = async () => {
        try {
            const res = await fetch('http://localhost:3000/logout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionToken })
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || "Logout failed");
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
            const actRes = await fetch('http://localhost:3000/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionToken, actionCode: "FIND-USER" })
            });
            if (!actRes.ok) throw new Error('Error requesting action token.');
            const { actionToken } = await actRes.json();
            navigate("/update", { state: { sessionToken, actionToken } });
        } catch (error) {
            console.error('Error fetching profile data:', error);
        }
    };

    const toggleSpotlight = (type) => {
        setActiveSpotlight(prev => (prev === type ? null : type));
        if (type === "topUp") {
            setSelectedCard(null);
            fetchUserCards();
        }
        if (type === "multiTransaction") {
            // reset bulk transaction state
            setBulkEmails([]);
            setBulkEmailInput("");
            setBulkAmount("");
        }
    };

    const fetchUserCards = async () => {
        try {
            const actRes = await fetch('http://localhost:3000/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionToken, actionCode: "SEARCH-CARD" })
            });
            if (!actRes.ok) throw new Error('Error requesting credit card data.');
            const { actionToken } = await actRes.json();
            const searchRes = await fetch('http://localhost:3002/searchCards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionToken, actionToken })
            });
            if (!searchRes.ok) {
                const errData = await searchRes.json();
                throw new Error(errData.message || "Error fetching cards.");
            }
            const cards = await searchRes.json();
            setUserCards(cards.map(card => `Card ending in ${card.cc_number.slice(-4)}`));
        } catch (error) {
            console.error("Error fetching user cards:", error);
            alert("Error fetching user cards: " + error.message);
        }
    };

    const handleTopUpSubmit = async (e) => {
        e.preventDefault();
        if (!topUpAmount || isNaN(topUpAmount) || Number(topUpAmount) <= 0) {
            alert("Please enter a valid top-up amount.");
            return;
        }
        try {
            const actRes = await fetch('http://localhost:3000/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionToken, actionCode: "ADD-TOP-UP" })
            });
            if (!actRes.ok) throw new Error('Error requesting token for top-up.');
            const { actionToken } = await actRes.json();
            const topUpRes = await fetch('http://localhost:3002/topUp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionToken, actionToken, quantity: parseFloat(topUpAmount), card: selectedCard })
            });
            if (!topUpRes.ok) {
                const errData = await topUpRes.json();
                alert("Error while adding top-up: " + errData.message);
            } else {
                alert("Top-up added successfully.");
                setActiveSpotlight(null);
                setBalance(prev => prev + parseFloat(topUpAmount));
                setTopUpAmount("");
                setUserCards([]);
                setSelectedCard(null);
            }
        } catch (error) {
            console.error("Error processing top-up:", error);
            alert("Error processing top-up.");
        }
    };

    const handleCreditCardSubmit = async (e) => {
        e.preventDefault();
        try {
            const actRes = await fetch('http://localhost:3000/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionToken, actionCode: "CREATE-CARD" })
            });
            if (!actRes.ok) throw new Error('Error requesting token to create card.');
            const { actionToken } = await actRes.json();
            const cardRes = await fetch('http://localhost:3002/createCard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionToken,
                    actionToken,
                    card: {
                        cc_number: creditCardNumber,
                        cc_expirationDate: creditCardExpirationDate,
                        cc_cvv: creditCardCVV
                    }
                })
            });
            if (!cardRes.ok) {
                const errData = await cardRes.json();
                alert("Error while creating card: " + errData.message);
            } else {
                alert("Credit card created successfully.");
                setActiveSpotlight(null);
                setCreditCardNumber("");
                setCreditCardExpirationDate("");
                setCreditCardCVV("");
            }
        } catch (error) {
            console.error("Error creating card:", error);
            alert("Error creating card.");
        }
    };

    const isValidEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleTransactionSubmit = async (e) => {
        e.preventDefault();
        if (!transactionEmail || !isValidEmail(transactionEmail)) {
            alert("Please introduce a valid email address.");
            return;
        }
        if (!transactionAmount || isNaN(transactionAmount) || Number(transactionAmount) <= 0) {
            alert("Please enter a valid amount.");
            return;
        }
        try {
            const actRes = await fetch('http://localhost:3000/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionToken, actionCode: "PERFORM-TRANSACTION" })
            });
            if (!actRes.ok) throw new Error('Error requesting token for transaction.');
            const { actionToken } = await actRes.json();
            const transRes = await fetch('http://localhost:3002/performTransaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionToken,
                    actionToken,
                    email: transactionEmail,
                    amount: parseFloat(transactionAmount)
                })
            });
            if (!transRes.ok) {
                const errData = await transRes.json();
                alert("Error while performing transaction: " + errData.error);
            } else {
                alert("Transaction performed successfully.");
                setActiveSpotlight(null);
                setBalance(prev => prev - parseFloat(transactionAmount));
                setTransactionEmail("");
                setTransactionAmount("");
            }
        } catch (error) {
            console.error("Error processing transaction:", error);
            alert("Error processing transaction.");
        }
    };

    // Add a single email to bulk list
    const addBulkEmail = () => {
        if (!bulkEmailInput || !isValidEmail(bulkEmailInput)) {
            alert("Please enter a valid email address.");
            return;
        }
        setBulkEmails(prev => [...prev, bulkEmailInput]);
        setBulkEmailInput("");
    };

    const handleMultiTransactionSubmit = async (e) => {
        e.preventDefault();
        if (bulkEmails.length === 0) {
            alert("Please add at least one email address.");
            return;
        }
        if (!bulkAmount || isNaN(bulkAmount) || Number(bulkAmount) <= 0) {
            alert("Please enter a valid amount.");
            return;
        }
        try {
            const actRes = await fetch('http://localhost:3000/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionToken, actionCode: "PERFORM-TRANSACTION" })
            });
            if (!actRes.ok) throw new Error('Error requesting token for bulk transaction.');
            const { actionToken } = await actRes.json();
            const bulkRes = await fetch('http://localhost:3002/performBulkTransaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionToken,
                    actionToken,
                    emails: bulkEmails,
                    amount: parseFloat(bulkAmount)
                })
            });
            if (!bulkRes.ok) {
                const errData = await bulkRes.json();
                alert("Error while performing bulk transaction: " + errData.error);
            } else {
                alert("Bulk transaction performed successfully.");
                setActiveSpotlight(null);
                setBalance(prev => prev - parseFloat(bulkAmount) * bulkEmails.length);
                setBulkEmails([]);
                setBulkEmailInput("");
                setBulkAmount("");
            }
        } catch (error) {
            console.error("Error processing bulk transaction:", error);
            alert("Error processing bulk transaction.");
        }
    };

    const handleRequestMoneySubmit = async (e) => {
        e.preventDefault();
        if (!requestMoneyEmail || !isValidEmail(requestMoneyEmail)) {
            alert("Please introduce a valid email address.");
            return;
        }
        if (!requestMoneyAmount || isNaN(requestMoneyAmount) || Number(requestMoneyAmount) <= 0) {
            alert("Please enter a valid amount.");
            return;
        }
        try {
            const actRes = await fetch('http://localhost:3000/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionToken, actionCode: "PERFORM-TRANSACTION" })
            });
            if (!actRes.ok) throw new Error('Error requesting token for money request.');
            const { actionToken } = await actRes.json();
            const reqMoneyRes = await fetch('http://localhost:3002/requestMoney', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionToken,
                    actionToken,
                    email: requestMoneyEmail,
                    amount: parseFloat(requestMoneyAmount),
                    message: requestMoneyMessage
                })
            });
            if (!reqMoneyRes.ok) {
                const errData = await reqMoneyRes.json();
                alert("Error while requesting money: " + errData.message);
            } else {
                alert("Money request sent successfully.");
                setActiveSpotlight(null);
                setRequestMoneyEmail("");
                setRequestMoneyAmount("");
                setRequestMoneyMessage("");
            }
        } catch (error) {
            console.error("Error processing money request:", error);
            alert("Error processing money request: " + error.message);
        }
    };

    const handleResolveRequest = async (transactionId, resolution) => {
        if (resolution !== "ACCEPTED" && resolution !== "DENIED") {
            console.error("Resolution value not valid:", resolution);
            return;
        }
        try {
            const actRes = await fetch('http://localhost:3000/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionToken, actionCode: "PERFORM-TRANSACTION" })
            });
            if (!actRes.ok) throw new Error('Error requesting token to resolve request.');
            const { actionToken } = await actRes.json();
            const resReq = await fetch('http://localhost:3002/resolveRequest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionToken, actionToken, transactionId, resolution })
            });
            if (!resReq.ok) {
                const errData = await resReq.json();
                alert("Error while resolving request: " + errData.error);
            } else {
                alert("Request resolved successfully.");
                loadPendingRequests();
            }
        } catch (error) {
            console.error("Error processing resolve request:", error);
            alert("Error processing resolve request: " + error.message);
        }
    };

    return (
        <div className="dashboard-page">
            <div className="gradient-background" />

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

            <main className="main">
                <div className="banner">
                    <h1>Welcome to your Dashboard</h1>
                    <h2>{userName || "User"}</h2>
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
                    <button className="glassy-button" onClick={() => toggleSpotlight("topUp")}>
                        <GoPlus size={24} />
                    </button>
                    <button className="glassy-button" onClick={() => toggleSpotlight("transaction")}>
                        <GoArrowSwitch size={24} />
                    </button>
                    <button className="glassy-button" onClick={() => toggleSpotlight("creditCard")}>
                        <GoCreditCard size={24} />
                    </button>
                    <button className="glassy-button" onClick={() => toggleSpotlight("requestMoney")}>
                        <GoRead size={24} />
                    </button>
                    <button className="glassy-button" onClick={() => toggleSpotlight("multiTransaction")}>
                        <GoPeople size={24} />
                    </button>
                </div>


                {activeSpotlight === "topUp" && (
                    <div className="top-up-wrapper">
                        <SpotlightCard className="custom-spotlight-card" spotlightColor="rgba(125, 36, 199, 0.81)">
                            {!selectedCard ? (
                                <>
                                    <h2>Select a card</h2>
                                    <AnimatedList
                                        items={userCards}
                                        onItemSelect={(item, index) => setSelectedCard(item)}
                                        showGradients={true}
                                        enableArrowNavigation={true}
                                        displayScrollbar={true}
                                    />
                                    <div className="button-row">
                                        <button type="button" className="btn glassy-button" onClick={() => setActiveSpotlight(null)}>
                                            Cancel
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h2>Top-Up for {selectedCard}</h2>
                                    <form onSubmit={handleTopUpSubmit} className="top-up-form">
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
                                            <button type="submit" className="btn glassy-button">Submit</button>
                                            <button type="button" className="btn glassy-button" onClick={() => {
                                                setSelectedCard(null);
                                                setTopUpAmount("");
                                            }}>
                                                Change Card
                                            </button>
                                        </div>
                                    </form>
                                </>
                            )}
                        </SpotlightCard>
                    </div>
                )}

                {activeSpotlight === "creditCard" && (
                    <div className="top-up-wrapper">
                        <SpotlightCard className="custom-spotlight-card" spotlightColor="rgba(125, 36, 199, 0.81)">
                            <form onSubmit={handleCreditCardSubmit} className="top-up-form">
                                <h2>Create Credit Card</h2>
                                <div className="form-group">
                                    <label htmlFor="cc_number">Card Number:</label>
                                    <input
                                        id="cc_number"
                                        type="text"
                                        value={creditCardNumber}
                                        onChange={(e) => setCreditCardNumber(e.target.value)}
                                        placeholder="16-digit card number"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="cc_expirationDate">Expiration Date:</label>
                                    <input
                                        id="cc_expirationDate"
                                        type="date"
                                        value={creditCardExpirationDate}
                                        onChange={(e) => setCreditCardExpirationDate(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="cc_cvv">CVV:</label>
                                    <input
                                        id="cc_cvv"
                                        type="text"
                                        value={creditCardCVV}
                                        onChange={(e) => setCreditCardCVV(e.target.value)}
                                        placeholder="3-digit CVV"
                                        required
                                    />
                                </div>
                                <div className="button-row">
                                    <button type="submit" className="btn glassy-button">Submit</button>
                                    <button type="button" className="btn glassy-button" onClick={() => setActiveSpotlight(null)}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </SpotlightCard>
                    </div>
                )}

                {activeSpotlight === "transaction" && (
                    <div className="top-up-wrapper">
                        <SpotlightCard className="custom-spotlight-card" spotlightColor="rgba(125, 36, 199, 0.81)">
                            <h2>Transfer</h2>
                            <form onSubmit={handleTransactionSubmit} className="top-up-form">
                                <div className="form-group">
                                    <label htmlFor="transactionEmail">Email:</label>
                                    <input
                                        id="transactionEmail"
                                        type="email"
                                        value={transactionEmail}
                                        onChange={(e) => setTransactionEmail(e.target.value)}
                                        placeholder="user@example.com"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="transactionAmount">Amount:</label>
                                    <input
                                        id="transactionAmount"
                                        type="number"
                                        value={transactionAmount}
                                        onChange={(e) => setTransactionAmount(e.target.value)}
                                        placeholder="Amount to transfer"
                                        required
                                    />
                                </div>
                                <div className="button-row">
                                    <button type="submit" className="btn glassy-button">Send</button>
                                    <button type="button" className="btn glassy-button" onClick={() => {
                                        setActiveSpotlight(null);
                                        setTransactionEmail("");
                                        setTransactionAmount("");
                                    }}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </SpotlightCard>
                    </div>
                )}

                {activeSpotlight === "requestMoney" && (
                    <div className="top-up-wrapper">
                        <SpotlightCard className="custom-spotlight-card" spotlightColor="rgba(125, 36, 199, 0.81)">
                            <h2>Request Money</h2>
                            <form onSubmit={handleRequestMoneySubmit} className="top-up-form">
                                <div className="form-group">
                                    <label htmlFor="requestMoneyEmail">Email:</label>
                                    <input
                                        id="requestMoneyEmail"
                                        type="email"
                                        value={requestMoneyEmail}
                                        onChange={(e) => setRequestMoneyEmail(e.target.value)}
                                        placeholder="john.doe@example.com"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="requestMoneyAmount">Amount:</label>
                                    <input
                                        id="requestMoneyAmount"
                                        type="number"
                                        value={requestMoneyAmount}
                                        onChange={(e) => setRequestMoneyAmount(e.target.value)}
                                        placeholder="50.00"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="requestMoneyMessage">Message:</label>
                                    <textarea
                                        id="requestMoneyMessage"
                                        value={requestMoneyMessage}
                                        onChange={(e) => setRequestMoneyMessage(e.target.value)}
                                        placeholder="Requesting money for lunch"
                                        required
                                    />
                                </div>
                                <div className="button-row">
                                    <button type="submit" className="btn glassy-button">Submit</button>
                                    <button type="button" className="btn glassy-button" onClick={() => {
                                        setActiveSpotlight(null);
                                        setRequestMoneyEmail("");
                                        setRequestMoneyAmount("");
                                        setRequestMoneyMessage("");
                                    }}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </SpotlightCard>
                    </div>
                )}

                {activeSpotlight === "multiTransaction" && (
                    <div className="top-up-wrapper">
                        <SpotlightCard className="custom-spotlight-card" spotlightColor="rgba(125, 36, 199, 0.81)">
                            <h2>Bulk Transfer</h2>
                            <form onSubmit={handleMultiTransactionSubmit} className="top-up-form">
                                <div className="form-group">
                                    <label htmlFor="bulkEmailInput">Email:</label>
                                    <input
                                        id="bulkEmailInput"
                                        type="email"
                                        value={bulkEmailInput}
                                        onChange={(e) => setBulkEmailInput(e.target.value)}
                                        placeholder="user@example.com"
                                    />
                                    <button type="button" className="btn glassy-button" onClick={addBulkEmail}>
                                        Add
                                    </button>
                                </div>
                                {bulkEmails.length > 0 && (
                                    <AnimatedList
                                        items={bulkEmails.map((email, idx) => (
                                            <div key={idx}>{email}</div>
                                        ))}
                                    />
                                )}
                                <div className="form-group">
                                    <label htmlFor="bulkAmount">Amount per email:</label>
                                    <input
                                        id="bulkAmount"
                                        type="number"
                                        value={bulkAmount}
                                        onChange={(e) => setBulkAmount(e.target.value)}
                                        placeholder="Amount"
                                        required
                                    />
                                </div>
                                <div className="button-row">
                                    <button type="submit" className="btn glassy-button">Submit</button>
                                    <button type="button" className="btn glassy-button" onClick={() => {
                                        setActiveSpotlight(null);
                                        setBulkEmails([]);
                                        setBulkEmailInput("");
                                        setBulkAmount("");
                                    }}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </SpotlightCard>
                    </div>
                )}
                <section className="pending-requests" ref={pendingRef}>
                    <div className="pending-requests-header">
                        <h2>Pending Requests</h2>
                        <button className="toggle-pending-btn" onClick={togglePendingRequests}>
                            {showPendingRequests ? <GoTriangleUp size={20} /> : <GoTriangleDown size={20} />}
                        </button>
                    </div>
                    {showPendingRequests && (
                        pendingRequests.length > 0 ? (
                            <AnimatedList
                                items={pendingRequests.map(item => (
                                    <div key={item.t_id} className="pending-item">
                                        <div>
                                            <strong>ID:</strong> {item.t_id} | <strong>Amount:</strong> {item.amount}€
                                            {item.t_message && <> | <strong>Message:</strong> {item.t_message}</>}
                                        </div>
                                        <div className="button-row">
                                            <button
                                                className="btn glassy-button"
                                                onClick={() => handleResolveRequest(item.t_id, "ACCEPTED")}
                                            >
                                                Accept
                                            </button>
                                            <button
                                                className="btn glassy-button"
                                                onClick={() => handleResolveRequest(item.t_id, "DENIED")}
                                            >
                                                Decline
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            />
                        ) : (
                            <p>No pending requests.</p>
                        )
                    )}
                </section>

            </main>
        </div>
    );
};

export default Dashboard;
