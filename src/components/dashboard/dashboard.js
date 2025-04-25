import React, {useState, useEffect, useRef} from "react";
import addDays from 'date-fns/addDays';
import './dashboard.css';
import {useLocation, useNavigate} from 'react-router-dom';
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

const TEST_PM_ID = "pm_card_visa";
const Dashboard = () => {
    const navigate = useNavigate();
    const {state} = useLocation();
    const sessionToken = state?.token;

    const fetchActionToken = async (actionCode) => {
        const res = await fetch('http://localhost:3000/action', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({sessionToken, actionCode})
        });
        if (!res.ok) throw new Error(`Error requesting token for ${actionCode}`);
        const {actionToken} = await res.json();
        return actionToken;
    };

    const processCardPayment = async ({amount, description, existingTxId = null}) => {
        let txId = existingTxId;

        if (!txId) {
            const txToken = await fetchActionToken("PERFORM-TRANSACTION");
            const txRes = await fetch('http://localhost:3002/performTransaction', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    sessionToken,
                    actionToken: txToken,
                    email: null,
                    amount: parseFloat(amount),
                    paymentMethod: 'card',
                    card: TEST_PM_ID
                })
            });
            if (!txRes.ok) {
                const err = await txRes.json();
                throw new Error("Error creating transaction: " + err.error);
            }
            txId = (await txRes.json()).transactionId;
        }

        const posToken = await fetchActionToken("CREATE-POS-ORDER");
        const posRes = await fetch('http://localhost:3002/createPosOrder', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                sessionToken,
                actionToken: posToken,
                amount: parseFloat(amount),
                description,
                expiresAt: addDays(new Date(), 3).toISOString()
            })
        });
        if (!posRes.ok) {
            const err = await posRes.json();
            throw new Error("Error creating POS order: " + err.error);
        }
        const pos_id = (await posRes.json()).pos_id;

        const payToken = await fetchActionToken("PAY-POS-ORDER");
        const payRes = await fetch('http://localhost:3002/payPosOrder', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                sessionToken,
                actionToken: payToken,
                orderId: pos_id,
                paymentMethodId: TEST_PM_ID,
                transactionId: txId
            })
        });
        if (!payRes.ok) {
            const err = await payRes.json();
            throw new Error("Error paying POS order: " + err.error);
        }

        return txId;
    };

    const [userData, setUserData] = useState(null);
    const [userName, setUserName] = useState("");
    const [balance, setBalance] = useState(0);
    const [activeSpotlight, setActiveSpotlight] = useState(null);

    // Top-up
    const [topUpAmount, setTopUpAmount] = useState("");
    const [userCards, setUserCards] = useState([]);        // [{id,label},…]
    const [selectedCard, setSelectedCard] = useState(null);

    // Create Card
    const [creditCardNumber, setCreditCardNumber] = useState("");
    const [creditCardExpirationDate, setCreditCardExpirationDate] = useState("");
    const [creditCardCVV, setCreditCardCVV] = useState("");

    // Transactions
    const [transactionEmail, setTransactionEmail] = useState("");
    const [transactionAmount, setTransactionAmount] = useState("");

    // Money Requests
    const [requestMoneyEmail, setRequestMoneyEmail] = useState("");
    const [requestMoneyAmount, setRequestMoneyAmount] = useState("");
    const [requestMoneyMessage, setRequestMoneyMessage] = useState("");

    // Bulk transfer
    const [bulkEmailInput, setBulkEmailInput] = useState("");
    const [bulkEmails, setBulkEmails] = useState([]);
    const [bulkAmount, setBulkAmount] = useState("");

    // Split transactions
    const [splitTransactions, setSplitTransactions] = useState([]);
    const [loadingSplits, setLoadingSplits] = useState(false);
    const [showSplits, setShowSplits] = useState(false);
    const splitsRef = useRef(null);

    // Pending requests
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loadingPending, setLoadingPending] = useState(false);
    const [showPendingRequests, setShowPendingRequests] = useState(false);
    const pendingRef = useRef(null);

    // Payment method and edit request
    const [paymentMethod, setPaymentMethod] = useState("balance"); // "balance" o "card"
    const [transactionCard, setTransactionCard] = useState(null);   // fachada visual
    const [editRequest, setEditRequest] = useState({id: null, resolution: null});

    const [frequentUsers, setFrequentUsers] = useState([]);

    useEffect(() => {
        if (!sessionToken) return;
        (async () => {
            try {
                const token1 = await fetchActionToken("FIND-USER");
                const findRes = await fetch('http://localhost:3002/find', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({sessionToken, actionToken: token1})
                });
                const acct = await findRes.json();
                setUserData(acct);
                setBalance(acct.b_balance || 0);
            } catch (error) {
                console.error("Error fetching account data:", error);
            }
            try {
                const token2 = await fetchActionToken("FIND-USER");
                const userRes = await fetch('http://localhost:3000/findUser', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({sessionToken, actionToken: token2})
                });
                const u = await userRes.json();
                setUserName(u.u_name || "User");
            } catch (error) {
                console.error("Error loading user data:", error);
            }
        })();
    }, [sessionToken]);

    useEffect(() => {
        if (showPendingRequests && pendingRef.current) pendingRef.current.scrollIntoView({behavior: "smooth"});
    }, [showPendingRequests]);
    useEffect(() => {
        if (showSplits && splitsRef.current) splitsRef.current.scrollIntoView({behavior: "smooth"});
    }, [showSplits]);

    const fetchUserCards = async () => {
        try {
            const token = await fetchActionToken("SEARCH-CARD");
            const res = await fetch('http://localhost:3002/searchCards', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({sessionToken, actionToken: token})
            });
            if (!res.ok) throw new Error("Error fetching cards");
            const cards = await res.json();
            const formatted = cards.map(c => ({
                id: c.paymentMethodId,
                label: `Card ending in ${c.cc_number.slice(-4)}`
            }));
            setUserCards(formatted);
        } catch (err) {
            console.error(err);
            alert("Error fetching cards: " + err.message);
        }
    };

    const fetchFrequentUsers = async (limit = 5) => {
        try {
            const token = await fetchActionToken("FIND-USER");
            const res = await fetch('http://localhost:3000/frequentUsers', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({sessionToken, actionToken: token, limit})
            });
            if (!res.ok) throw new Error('Error fetching recent users');
            const users = await res.json();
            console.log('FrequentUsers result:', users);
            setFrequentUsers(users);
        } catch (err) {
            console.error(err);
        }
    };
    // Top-Up handler
    const handleTopUpSubmit = async (e) => {
        e.preventDefault();
        try {
            if (paymentMethod === "card") {
                const posToken = await fetchActionToken("CREATE-POS-ORDER");
                const posRes = await fetch('http://localhost:3002/createPosOrder', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        sessionToken,
                        actionToken: posToken,
                        amount: parseFloat(topUpAmount),
                        description: `Top-up ${topUpAmount}€`,
                        expiresAt: addDays(new Date(), 3).toISOString()
                    })
                });
                if (!posRes.ok) {
                    const err = await posRes.json();
                    throw new Error("Error creating POS order: " + err.error);
                }
                const { pos_id } = await posRes.json();


                const payToken = await fetchActionToken("PAY-POS-ORDER");
                const payRes = await fetch('http://localhost:3002/payPosOrder', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        sessionToken,
                        actionToken: payToken,
                        orderId: pos_id,
                        paymentMethodId: TEST_PM_ID
                    })
                });
                if (!payRes.ok) {
                    const err = await payRes.json();
                    throw new Error("Error paying POS order: " + err.error);
                }
                const { transactionId } = await payRes.json();

                const registerToken = await fetchActionToken("ADD-TOP-UP");
                const registerRes = await fetch('http://localhost:3002/topUp', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        sessionToken,
                        actionToken: registerToken,
                        transactionId,
                        quantity: parseFloat(topUpAmount)
                    })
                });
                if (!registerRes.ok) {
                    const err = await registerRes.json();
                    throw new Error("Error registering top-up: " + err.message);
                }
                setBalance(b => b + parseFloat(topUpAmount));
                alert(`Top-up con tarjeta completado. TxID: ${transactionId}`);
            } else {
                const token = await fetchActionToken("ADD-TOP-UP");
                const res = await fetch('http://localhost:3002/topUp', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        sessionToken,
                        actionToken: token,
                        quantity: parseFloat(topUpAmount),
                        card: selectedCard
                    })
                });
                if (!res.ok) {
                    const err = await res.json();
                    throw new Error("Error adding top-up: " + err.message);
                }
                setBalance(b => b + parseFloat(topUpAmount));
                alert("Top-up added successfully.");
            }

            setActiveSpotlight(null);
            setTopUpAmount("");
            setSelectedCard(null);

        } catch (error) {
            console.error("Error en Top-Up:", error);
            alert(error.message);
        }
    };

    // Transfer handler
    const handleTransactionSubmit = async (e) => {
        e.preventDefault();
        try {
            if (paymentMethod === "card") {
                const txToken = await fetchActionToken("PERFORM-TRANSACTION");
                const txRes = await fetch('http://localhost:3002/performTransaction', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        sessionToken,
                        actionToken: txToken,
                        email: transactionEmail,
                        amount: parseFloat(transactionAmount),
                        paymentMethod: 'card',
                        card: TEST_PM_ID
                    })
                });
                if (!txRes.ok) {
                    const err = await txRes.json();
                    throw new Error("Error performing transaction: " + err.error);
                }
                const {transactionId} = await txRes.json();

                const posToken = await fetchActionToken("CREATE-POS-ORDER");
                const posRes = await fetch('http://localhost:3002/createPosOrder', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        sessionToken,
                        actionToken: posToken,
                        amount: parseFloat(transactionAmount),
                        description: `Transfer to ${transactionEmail}`,
                        expiresAt: addDays(new Date(), 3).toISOString()
                    })
                });
                if (!posRes.ok) {
                    const err = await posRes.json();
                    throw new Error("Error creating POS order: " + err.error);
                }
                const {pos_id} = await posRes.json();

                const payToken = await fetchActionToken("PAY-POS-ORDER");
                const payRes = await fetch('http://localhost:3002/payPosOrder', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        sessionToken,
                        actionToken: payToken,
                        orderId: pos_id,
                        paymentMethodId: TEST_PM_ID,
                        transactionId
                    })
                });
                if (!payRes.ok) {
                    const err = await payRes.json();
                    throw new Error("Error paying POS order: " + err.error);
                }

                setBalance(b => b - parseFloat(transactionAmount));
                alert(`Transference finished successfully. TxID: ${transactionId}`);
            } else {
                const token = await fetchActionToken("PERFORM-TRANSACTION");
                const res = await fetch('http://localhost:3002/performTransaction', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        sessionToken,
                        actionToken: token,
                        email: transactionEmail,
                        amount: parseFloat(transactionAmount)
                    })
                });
                if (!res.ok) {
                    const err = await res.json();
                    alert("Error performing transaction: " + err.error);
                } else {
                    setBalance(b => b - parseFloat(transactionAmount));
                    alert("Transaction performed successfully.");
                }
            }
            setActiveSpotlight(null);
            setTransactionEmail("");
            setTransactionAmount("");
            setPaymentMethod("balance");
            setTransactionCard(null);
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    };

    // Request Money handler
    const handleRequestMoneySubmit = async (e) => {
        e.preventDefault();
        try {
            const token = await fetchActionToken("PERFORM-TRANSACTION");
            const reqRes = await fetch('http://localhost:3002/requestMoney', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    sessionToken,
                    actionToken: token,
                    email: requestMoneyEmail,
                    amount: parseFloat(requestMoneyAmount),
                    message: requestMoneyMessage
                })
            });
            const {transactionId} = await reqRes.json();
            alert(`Money request sent successfully. ID: ${transactionId}`);
            setActiveSpotlight(null);
            setRequestMoneyEmail("");
            setRequestMoneyAmount("");
            setRequestMoneyMessage("");
        } catch (error) {
            console.error("Error processing money request:", error);
            alert(error.message);
        }
    };

    // Bulk transfer handlers
    const addBulkEmail = () => {
        if (!bulkEmailInput) {
            alert("Please enter a valid email address.");
            return;
        }
        setBulkEmails(prev => [...prev, bulkEmailInput]);
        setBulkEmailInput("");
    };
    const handleMultiTransactionSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = await fetchActionToken("PERFORM-TRANSACTION");
            const bulkRes = await fetch('http://localhost:3002/performBulkTransaction', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    sessionToken,
                    actionToken: token,
                    emails: bulkEmails,
                    amount: parseFloat(bulkAmount)
                })
            });
            if (!bulkRes.ok) {
                const err = await bulkRes.json();
                alert("Error while performing bulk transaction: " + err.error);
            } else {
                alert("Bulk transaction performed successfully.");
                setActiveSpotlight(null);
                setBulkEmails([]);
                setBulkEmailInput("");
                setBulkAmount("");
            }
        } catch (error) {
            console.error("Error processing bulk transaction:", error);
            alert(error.message);
        }
    };

    // Pending requests loaders & toggles
    const loadPendingRequests = async () => {
        if (loadingPending) return;
        setLoadingPending(true);
        try {
            const token = await fetchActionToken("LOAD-TRANSACTIONS");
            const res = await fetch('http://localhost:3002/loadPendingTransactions', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({sessionToken, actionToken: token})
            });
            const {transactions} = await res.json();
            setPendingRequests(transactions);
        } catch (error) {
            console.error("Error loading pending transactions:", error);
            alert(error.message);
        } finally {
            setLoadingPending(false);
        }
    };
    const togglePendingRequests = () => {
        if (!showPendingRequests) loadPendingRequests();
        setShowPendingRequests(prev => !prev);
    };

    // Resolve request handler
    const handleResolveSubmit = async (e) => {
        e.preventDefault();
        const {id, resolution} = editRequest;
        try {
            if (resolution === "ACCEPTED" && paymentMethod === "card") {
                await processCardPayment({
                    amount: pendingRequests.find(r => r.t_id === id).amount,
                    description: `Accept request ${id}`,
                    existingTxId: id
                });
            }
            const token = await fetchActionToken("PERFORM-TRANSACTION");
            await fetch('http://localhost:3002/resolveRequest', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({sessionToken, actionToken: token, transactionId: id, resolution})
            });
            alert("Request resolved successfully.");
            setEditRequest({id: null, resolution: null});
            setPaymentMethod("balance");
            setTransactionCard(null);
            loadPendingRequests();
        } catch (error) {
            console.error("Error resolving request:", error);
            alert(error.message);
        }
    };

    // Split transactions
    const loadSplitTransactions = async () => {
        if (loadingSplits) return;
        setLoadingSplits(true);
        try {
            const token = await fetchActionToken("LOAD-TRANSACTIONS");
            const res = await fetch('http://localhost:3002/loadSplitTransactions', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({sessionToken, actionToken: token})
            });
            const {splits} = await res.json();
            setSplitTransactions(splits);
        } catch (error) {
            console.error("Error loading split transactions:", error);
            alert(error.message);
        } finally {
            setLoadingSplits(false);
        }
    };
    const toggleSplits = () => {
        if (!showSplits) loadSplitTransactions();
        setShowSplits(prev => !prev);
    };

    // Create Credit Card handler
    const handleCreditCardSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = await fetchActionToken("CREATE-CARD");
            const res = await fetch('http://localhost:3002/createCard', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    sessionToken,
                    actionToken: token,
                    card: {
                        cc_number: creditCardNumber,
                        cc_expirationDate: creditCardExpirationDate,
                        cc_cvv: creditCardCVV
                    }
                })
            });
            if (!res.ok) {
                const err = await res.json();
                alert("Error creating card: " + err.message);
            } else {
                alert("Credit card created successfully.");
                setActiveSpotlight(null);
                setCreditCardNumber("");
                setCreditCardExpirationDate("");
                setCreditCardCVV("");
            }
        } catch (error) {
            console.error("Error creating card:", error);
            alert(error.message);
        }
    };

    // Logout & Profile
    const handleLogout = async () => {
        try {
            await fetch('http://localhost:3000/logout', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({sessionToken})
            });
            navigate("/login");
        } catch (error) {
            console.error("Error during logout:", error);
            alert(error.message);
        }
    };
    const handleProfile = async (e) => {
        e.preventDefault();
        try {
            const token = await fetchActionToken("FIND-USER");
            navigate("/update", {state: {sessionToken, actionToken: token}});
        } catch (error) {
            console.error("Error fetching profile data:", error);
        }
    };

    const toggleSpotlight = (type) => {
        setActiveSpotlight(prev => prev === type ? null : type);
        if (type === "topUp" || type === "transaction") {
            setPaymentMethod("balance");
            setTransactionCard(null);
            fetchUserCards();
        }
        if (type === "requestMoney") {
            setPaymentMethod("balance");
            setTransactionCard(null);
        }
        if (type === "multiTransaction") {
            setBulkEmails([]);
            setBulkEmailInput("");
            setBulkAmount("");
        }
        if (['transaction','requestMoney','multiTransaction'].includes(type)) {
            fetchFrequentUsers(5);
        }
    };

    return (
        <div className="dashboard-page">
            <div className="gradient-background"/>

            <header className="header">
                <nav className="navbar">
                    <div className="navbar-logo"><h2>Orion</h2></div>
                    <div className="navbar-buttons">
                        <button className="btn logout" onClick={handleLogout}>Logout</button>
                        <button className="btn profile" onClick={handleProfile}>User Profile</button>
                    </div>
                </nav>
            </header>

            <main className="main">
                {/* Banner */}
                <div className="banner">
                    <h1>Welcome to your Dashboard</h1>
                    <h2>{userName}</h2>
                </div>

                {/* Balance */}
                <section className="features">
                    <h2>Balance:</h2>
                    <CountUp from={0} to={balance} duration={0.25} separator="," className="count-up-text"/>
                    <span> €</span>
                </section>

                {/* Principal Buttons */}
                <div className="button-container">
                    <button className="glassy-button" onClick={() => toggleSpotlight("topUp")}><GoPlus size={24}/>
                    </button>
                    <button className="glassy-button" onClick={() => toggleSpotlight("transaction")}><GoArrowSwitch
                        size={24}/></button>
                    <button className="glassy-button" onClick={() => toggleSpotlight("creditCard")}><GoCreditCard
                        size={24}/></button>
                    <button className="glassy-button" onClick={() => toggleSpotlight("requestMoney")}><GoRead
                        size={24}/></button>
                    <button className="glassy-button" onClick={() => toggleSpotlight("multiTransaction")}><GoPeople
                        size={24}/></button>
                </div>

                {/* Top-Up */}
                {activeSpotlight === "topUp" && (
                    <div className="top-up-wrapper">
                        <SpotlightCard spotlightColor="rgba(125, 36, 199, 0.81)">
                            <h2>Top-Up</h2>

                            <div className="form-group">
                                <label>Select card (optional):</label>
                                <AnimatedList
                                    items={userCards.map(c => c.label)}
                                    onItemSelect={(label) => {
                                        const card = userCards.find(c => c.label === label);
                                        if (card) setSelectedCard(card.id);
                                    }}
                                    showGradients
                                    enableArrowNavigation
                                    displayScrollbar
                                />
                            </div>

                            <form onSubmit={handleTopUpSubmit} className="top-up-form">
                                <div className="form-group">
                                    <label htmlFor="amount">Amount:</label>
                                    <input
                                        id="amount"
                                        type="number"
                                        value={topUpAmount}
                                        onChange={e => setTopUpAmount(e.target.value)}
                                        placeholder="Enter amount"
                                        required
                                        className="top-up-input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Payment method:</label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="card"
                                            checked={paymentMethod === "card"}
                                            onChange={() => setPaymentMethod("card")}
                                        /> Card
                                    </label>
                                </div>

                                <div className="button-row">
                                    <button type="submit" className="btn glassy-button">
                                        Accept
                                    </button>
                                    <button
                                        type="button"
                                        className="btn glassy-button"
                                        onClick={() => {
                                            setActiveSpotlight(null);
                                            setTopUpAmount("");
                                            setSelectedCard(null);
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </SpotlightCard>
                    </div>
                )}


                {/* Create Card */}
                {activeSpotlight === "creditCard" && (
                    <div className="top-up-wrapper">
                        <SpotlightCard spotlightColor="rgba(125, 36, 199, 0.81)">
                            <h2>Create Credit Card</h2>
                            <form onSubmit={handleCreditCardSubmit} className="top-up-form">
                                <div className="form-group">
                                    <label htmlFor="cc_number">Card Number:</label>
                                    <input
                                        id="cc_number"
                                        type="text"
                                        value={creditCardNumber}
                                        onChange={e => setCreditCardNumber(e.target.value)}
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
                                        onChange={e => setCreditCardExpirationDate(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="cc_cvv">CVV:</label>
                                    <input
                                        id="cc_cvv"
                                        type="text"
                                        value={creditCardCVV}
                                        onChange={e => setCreditCardCVV(e.target.value)}
                                        placeholder="3-digit CVV"
                                        required
                                    />
                                </div>
                                <div className="button-row">
                                    <button type="submit" className="btn glassy-button">Submit</button>
                                    <button type="button" className="btn glassy-button"
                                            onClick={() => setActiveSpotlight(null)}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </SpotlightCard>
                    </div>
                )}

                {/* Transfer */}
                    {activeSpotlight === "transaction" && (
                        <div className="top-up-wrapper">
                            <SpotlightCard spotlightColor="rgba(125, 36, 199, 0.81)">
                                <h2>Transfer</h2>
                                {/* Recent users list */}
                                {frequentUsers.length > 0 && (
                                    <div className="form-group">
                                        <label>Recent Contacts:</label>
                                        <AnimatedList
                                            items={frequentUsers.map(u => `${u.u_name} ${u.u_lastName} <${u.u_email}>`)}
                                            onItemSelect={(_, idx) => setTransactionEmail(frequentUsers[idx].u_email)}
                                            showGradients
                                            enableArrowNavigation
                                            displayScrollbar
                                        />
                                    </div>
                                )}
                                <form onSubmit={handleTransactionSubmit} className="top-up-form">
                                    <div className="form-group">
                                        <label htmlFor="transactionEmail">Email:</label>
                                        <input
                                            id="transactionEmail"
                                            type="email"
                                            value={transactionEmail}
                                            onChange={e => setTransactionEmail(e.target.value)}
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
                                        onChange={e => setTransactionAmount(e.target.value)}
                                        placeholder="Amount to transfer"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Método de pago:</label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="balance"
                                            checked={paymentMethod === "balance"}
                                            onChange={() => setPaymentMethod("balance")}
                                        /> Balance
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="card"
                                            checked={paymentMethod === "card"}
                                            onChange={() => setPaymentMethod("card")}
                                        /> Card
                                    </label>
                                </div>
                                {paymentMethod === "card" && (
                                    <div className="form-group">
                                        <label>Selecciona tarjeta:</label>
                                        <AnimatedList
                                            items={userCards.map(c => c.label)}
                                            onItemSelect={(_, idx) => setTransactionCard(userCards[idx].id)}
                                            showGradients
                                            enableArrowNavigation
                                            displayScrollbar
                                        />
                                    </div>
                                )}
                                <div className="button-row">
                                    <button type="submit" className="btn glassy-button">Send</button>
                                    <button type="button" className="btn glassy-button" onClick={() => {
                                        setActiveSpotlight(null);
                                        setTransactionEmail("");
                                        setTransactionAmount("");
                                        setPaymentMethod("balance");
                                        setTransactionCard(null);
                                    }}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </SpotlightCard>
                    </div>
                )}

                {/* Request Money */}
                {activeSpotlight === "requestMoney" && (
                    <div className="top-up-wrapper">
                        <SpotlightCard spotlightColor="rgba(125, 36, 199, 0.81)">
                            <h2>Request Money</h2>
                            {/* Recent users */}
                            {frequentUsers.length > 0 && (
                                <div className="form-group">
                                    <label>Recent Contacts:</label>
                                    <AnimatedList
                                        items={frequentUsers.map(u => `${u.u_name} ${u.u_lastName} <${u.u_email}>`)}
                                        onItemSelect={(_, idx) => setRequestMoneyEmail(frequentUsers[idx].u_email)}
                                        showGradients
                                        enableArrowNavigation
                                        displayScrollbar
                                    />
                                </div>
                            )}
                            <form onSubmit={handleRequestMoneySubmit} className="top-up-form">
                                {/* Request Money */}
                                <div className="form-group">
                                    <label htmlFor="requestMoneyAmount">Amount:</label>
                                    <input
                                        id="requestMoneyAmount"
                                        type="number"
                                        value={requestMoneyAmount}
                                        onChange={e => setRequestMoneyAmount(e.target.value)}
                                        placeholder="50.00"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="requestMoneyMessage">Message:</label>
                                    <textarea
                                        id="requestMoneyMessage"
                                        value={requestMoneyMessage}
                                        onChange={e => setRequestMoneyMessage(e.target.value)}
                                        placeholder="Requesting money for lunch"
                                        required
                                    />
                                </div>
                                <div className="button-row">
                                    <button type="submit" className="btn glassy-button">Submit</button>
                                    <button
                                        type="button"
                                        className="btn glassy-button"
                                        onClick={() => {
                                            setActiveSpotlight(null);
                                            setRequestMoneyEmail("");
                                            setRequestMoneyAmount("");
                                            setRequestMoneyMessage("");
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </SpotlightCard>
                    </div>
                )}

                {/* Bulk Transfer */}
                {activeSpotlight === "multiTransaction" && (
                    <div className="top-up-wrapper">
                        <SpotlightCard spotlightColor="rgba(125, 36, 199, 0.81)">
                            <h2>Bulk Transfer</h2>
                            {/* Recent users: click to add to bulkEmails */}
                            {frequentUsers.length > 0 && (
                                <div className="form-group">
                                    <label>Recent Contacts:</label>
                                    <AnimatedList
                                        items={frequentUsers.map(u => `${u.u_name} ${u.u_lastName} <${u.u_email}>`)}
                                        onItemSelect={(_, idx) => setBulkEmails(prev => [...prev, frequentUsers[idx].u_email])}
                                        showGradients
                                        enableArrowNavigation
                                        displayScrollbar
                                    />
                                </div>
                            )}>
                            )}
                            <form onSubmit={handleMultiTransactionSubmit} className="top-up-form">
                                {bulkEmails.length > 0 && (
                                    <AnimatedList
                                        items={bulkEmails.map((email, idx) => (
                                            <div key={idx}>{email}</div>
                                        ))}
                                    />
                                )}
                                <div className="form-group">
                                    <label htmlFor="bulkAmount">Amount to split:</label>
                                    <input
                                        id="bulkAmount"
                                        type="number"
                                        value={bulkAmount}
                                        onChange={e => setBulkAmount(e.target.value)}
                                        placeholder="Amount"
                                        required
                                    />
                                </div>
                                <div className="button-row">
                                    <button type="submit" className="btn glassy-button">Submit</button>
                                    <button
                                        type="button"
                                        className="btn glassy-button"
                                        onClick={() => {
                                            setActiveSpotlight(null);
                                            setBulkEmails([]);
                                            setBulkEmailInput("");
                                            setBulkAmount("");
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </SpotlightCard>
                    </div>
                )}

                {/* Pending Requests */}
                <section className="pending-requests" ref={pendingRef}>
                    <div className="pending-requests-header">
                        <h2>Pending Requests</h2>
                        <button className="toggle-pending-btn" onClick={togglePendingRequests}>
                            {showPendingRequests ? <GoTriangleUp size={20}/> : <GoTriangleDown size={20}/>}
                        </button>
                    </div>
                    {showPendingRequests && (
                        pendingRequests.length > 0 ? (
                            <AnimatedList
                                items={pendingRequests.map(item => (
                                    <div key={item.t_id} className="pending-item">
                                        <div>
                                            <strong>From:</strong> {item.senderName}
                                            {' | '}
                                            <strong>Message:</strong> {item.t_message}
                                            {' | '}
                                            <strong>Amount:</strong> {item.amount}€
                                        </div>
                                        <div className="button-row">
                                            {editRequest.id === item.t_id ? (
                                                <form onSubmit={handleResolveSubmit} className="top-up-form">
                                                    <div className="form-group">
                                                        <label>
                                                            <input
                                                                type="radio"
                                                                name="paymentMethod"
                                                                value="balance"
                                                                checked={paymentMethod === "balance"}
                                                                onChange={() => setPaymentMethod("balance")}
                                                            /> Balance
                                                        </label>
                                                        <label>
                                                            <input
                                                                type="radio"
                                                                name="paymentMethod"
                                                                value="card"
                                                                checked={paymentMethod === "card"}
                                                                onChange={() => setPaymentMethod("card")}
                                                            /> Card
                                                        </label>
                                                    </div>
                                                    {paymentMethod === "card" && (
                                                        <div className="form-group">
                                                            <label>Select card:</label>
                                                            <AnimatedList
                                                                items={userCards.map(c => c.label)}
                                                                onItemSelect={(_, idx) => setTransactionCard(userCards[idx].id)}
                                                                showGradients
                                                                enableArrowNavigation
                                                                displayScrollbar
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="button-row">
                                                        <button type="submit" className="btn glassy-button">Confirm
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn glassy-button"
                                                            onClick={() => {
                                                                setEditRequest({id: null, resolution: null});
                                                                setPaymentMethod("balance");
                                                                setTransactionCard(null);
                                                            }}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </form>
                                            ) : (
                                                <>
                                                    <button
                                                        className="btn glassy-button"
                                                        onClick={() => {
                                                            setEditRequest({id: item.t_id, resolution: "ACCEPTED"});
                                                            fetchUserCards();
                                                        }}
                                                    >
                                                        Accept
                                                    </button>
                                                    <button
                                                        className="btn glassy-button"
                                                        onClick={() => setEditRequest({
                                                            id: item.t_id,
                                                            resolution: "DENIED"
                                                        })}
                                                    >
                                                        Decline
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            />
                        ) : (
                            <p>No pending requests.</p>
                        )
                    )}
                </section>

                {/* Split Transactions */}
                <section className="pending-requests" ref={splitsRef}>
                    <div className="pending-requests-header">
                        <h2>Split Transactions</h2>
                        <button className="toggle-pending-btn" onClick={toggleSplits}>
                            {showSplits ? <GoTriangleUp size={20}/> : <GoTriangleDown size={20}/>}
                        </button>
                    </div>
                    {showSplits && (
                        splitTransactions.length > 0 ? (
                            <AnimatedList items={splitTransactions.map(tx => (
                                <div key={tx.t_id} className="pending-item">
                                    <div>
                                        <strong>From:</strong> {tx.senderName}
                                        {' | '}
                                        <strong>Group:</strong> {tx.split_group_id}
                                        {' | '}
                                        <strong>Amount:</strong> {tx.amount}€
                                    </div>
                                    <div className="button-row">
                                        <span className="status">{tx.t_state}</span>
                                    </div>
                                </div>
                            ))}
                            />
                        ) : (
                            <p>No split transactions.</p>
                        )
                    )}
                </section>
            </main>
        </div>
    );
};

export default Dashboard;
