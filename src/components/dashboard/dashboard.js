import React, { useState, useEffect, useRef } from "react";
import './dashboard.css';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  GoArrowSwitch,
  GoCreditCard,
  GoPlus,
  GoRead,
  GoTriangleDown,
  GoTriangleUp
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

  const [pendingRequests, setPendingRequests] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [showPendingRequests, setShowPendingRequests] = useState(false);

  // Referencia para la sección de Pending Requests
  const pendingRef = useRef(null);

  // Cargar datos de cuenta y usuario al iniciar la página
  useEffect(() => {
    if (!sessionToken) return;
    const fetchData = async () => {
      try {
        // Obtener token y datos de la cuenta
        const actionRes = await fetch('http://localhost:3000/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionToken, actionCode: "FIND-USER" })
        });
        if (!actionRes.ok) throw new Error('Error solicitando token de acción.');
        const actionData = await actionRes.json();
        const actionToken = actionData.actionToken;
        const findRes = await fetch('http://localhost:3002/find', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionToken, actionToken })
        });
        if (!findRes.ok) throw new Error('Error en la consulta de la cuenta.');
        const accountData = await findRes.json();
        setUserData(accountData);
        setBalance(accountData.b_balance || 0);
      } catch (error) {
        console.error("Error fetching account data:", error);
      }
      try {
        // Obtener token y datos del usuario
        const userActRes = await fetch('http://localhost:3000/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionToken, actionCode: "FIND-USER" })
        });
        if (!userActRes.ok) throw new Error('Error solicitando token de usuario.');
        const userActData = await userActRes.json();
        const userActToken = userActData.actionToken;
        const userRes = await fetch('http://localhost:3000/findUser', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionToken, actionToken: userActToken })
        });
        if (!userRes.ok) throw new Error('Error en la consulta del usuario.');
        const userData = await userRes.json();
        setUserName(userData.u_name || "User");
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };
    fetchData();
  }, [sessionToken]);

  // NOTA: Se elimina la carga automática de transacciones pendientes.
  // Ahora se cargan al pulsar el botón desplegable.

  // Desplazar la vista hacia la sección de Pending Requests al expandirla
  useEffect(() => {
    if (showPendingRequests && pendingRef.current) {
      pendingRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [showPendingRequests]);

  const loadPendingRequests = async () => {
    if (loadingPending) return; // Evita llamadas simultáneas
    setLoadingPending(true);
    try {
      const actionRes = await fetch('http://localhost:3000/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken, actionCode: "LOAD-TRANSACTIONS" })
      });
      if (!actionRes.ok) throw new Error('Error solicitando token para cargar transacciones.');
      const actionData = await actionRes.json();
      const actionToken = actionData.actionToken;
      const pendingRes = await fetch('http://localhost:3002/loadPendingTransactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken, actionToken })
      });
      if (!pendingRes.ok) {
        const errorData = await pendingRes.json();
        throw new Error(errorData.message || "Error al cargar transacciones pendientes");
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
      // Se carga la lista al expandirla
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
      if (!actRes.ok) throw new Error('Error solicitando token de acción.');
      const actData = await actRes.json();
      const actionToken = actData.actionToken;
      navigate("/update", { state: { sessionToken, actionToken } });
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };

  // Abre o cierra modales (topUp, transaction, requestMoney)
  const toggleSpotlight = (type) => {
    setActiveSpotlight(prev => (prev === type ? null : type));
    if (type === "topUp") {
      setSelectedCard(null);
      fetchUserCards();
    }
  };

  const fetchUserCards = async () => {
    try {
      const actRes = await fetch('http://localhost:3000/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken, actionCode: "SEARCH-CARD" })
      });
      if (!actRes.ok) throw new Error('Error solicitando token de búsqueda de tarjeta.');
      const actData = await actRes.json();
      const actionToken = actData.actionToken;
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
      setUserCards(cards.map(card => `Tarjeta terminada en ${card.cc_number.slice(-4)}`));
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
      if (!actRes.ok) throw new Error('Error solicitando token para top-up.');
      const actData = await actRes.json();
      const actionToken = actData.actionToken;
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
      if (!actRes.ok) throw new Error('Error solicitando token para crear tarjeta.');
      const actData = await actRes.json();
      const actionToken = actData.actionToken;
      const cardRes = await fetch('http://localhost:3002/createCard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionToken,
          actionToken,
          card: { cc_number: creditCardNumber, cc_expirationDate: creditCardExpirationDate, cc_cvv: creditCardCVV }
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
      alert("Por favor, introduce un correo electrónico válido.");
      return;
    }
    if (!transactionAmount || isNaN(transactionAmount) || Number(transactionAmount) <= 0) {
      alert("Por favor, introduce una cantidad válida.");
      return;
    }
    try {
      const actRes = await fetch('http://localhost:3000/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken, actionCode: "PERFORM-TRANSACTION" })
      });
      if (!actRes.ok) throw new Error('Error solicitando token para transacción.');
      const actData = await actRes.json();
      const actionToken = actData.actionToken;
      const transRes = await fetch('http://localhost:3002/performTransaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken, actionToken, email: transactionEmail, amount: parseFloat(transactionAmount) })
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

  const handleRequestMoneySubmit = async (e) => {
    e.preventDefault();
    if (!requestMoneyEmail || !isValidEmail(requestMoneyEmail)) {
      alert("Por favor, introduce un correo electrónico válido.");
      return;
    }
    if (!requestMoneyAmount || isNaN(requestMoneyAmount) || Number(requestMoneyAmount) <= 0) {
      alert("Por favor, introduce una cantidad válida.");
      return;
    }
    try {
      const actRes = await fetch('http://localhost:3000/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken, actionCode: "PERFORM-TRANSACTION" })
      });
      if (!actRes.ok) throw new Error('Error solicitando token para request money.');
      const actData = await actRes.json();
      const actionToken = actData.actionToken;
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
      alert("Error processing money request.");
    }
  };

  const handleResolveRequest = async (transactionId, resolution) => {
    if (resolution !== "ACCEPTED" && resolution !== "DENIED") {
      console.error("Valor de resolución no válido:", resolution);
      return;
    }

    try {
      const actRes = await fetch('http://localhost:3000/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken, actionCode: "PERFORM-TRANSACTION" })
      });
      if (!actRes.ok) throw new Error('Error solicitando token para resolver request.');
      const actData = await actRes.json();
      const actionToken = actData.actionToken;

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
      <div className="gradient-background">
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
          <h2>{userName || "User"}</h2>
        </div>
        <section className="features">
          <h2>Balance:</h2>
          <CountUp from={0} to={balance} duration={0.25} separator="," className="count-up-text" />
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
        </div>


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
                      <button className="btn glassy-button" onClick={() => handleResolveRequest(item.t_id, "ACCEPTED")}>
                        Accept
                      </button>
                      <button className="btn glassy-button" onClick={() => handleResolveRequest(item.t_id, "DENIED")}>
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

        {activeSpotlight === "topUp" && (
          <div className="top-up-wrapper">
            <SpotlightCard className="custom-spotlight-card" spotlightColor="rgba(125, 36, 199, 0.81)">
              {!selectedCard ? (
                <>
                  <h2>Selecciona una tarjeta</h2>
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
                  <h2>Top-Up para {selectedCard}</h2>
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
              <h2>Transferencia</h2>
              <form onSubmit={handleTransactionSubmit} className="top-up-form">
                <div className="form-group">
                  <label htmlFor="transactionEmail">Correo electrónico:</label>
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
                  <label htmlFor="transactionAmount">Cantidad:</label>
                  <input
                    id="transactionAmount"
                    type="number"
                    value={transactionAmount}
                    onChange={(e) => setTransactionAmount(e.target.value)}
                    placeholder="Cantidad a transferir"
                    required
                  />
                </div>
                <div className="button-row">
                  <button type="submit" className="btn glassy-button">Enviar</button>
                  <button type="button" className="btn glassy-button" onClick={() => {
                    setActiveSpotlight(null);
                    setTransactionEmail("");
                    setTransactionAmount("");
                  }}>
                    Cancelar
                  </button>
                </div>
              </form>
            </SpotlightCard>
          </div>
        )}
        {activeSpotlight === "requestMoney" && (
          <div className="top-up-wrapper">
            <SpotlightCard className="custom-spotlight-card" spotlightColor="rgba(125, 36, 199, 0.81)">
              <h2>Solicitar Dinero</h2>
              <form onSubmit={handleRequestMoneySubmit} className="top-up-form">
                <div className="form-group">
                  <label htmlFor="requestMoneyEmail">Correo electrónico:</label>
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
                  <label htmlFor="requestMoneyAmount">Cantidad:</label>
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
                  <label htmlFor="requestMoneyMessage">Mensaje:</label>
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
                    Cancelar
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
