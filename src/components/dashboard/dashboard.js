import React, { useState, useEffect } from "react";
import './dashboard.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { GoArrowSwitch, GoCreditCard, GoPlus, GoRead } from "react-icons/go";
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

  useEffect(() => {
    if (!sessionToken) return;
    const fetchData = async () => {
      try {
        const actionResponse = await fetch('http://localhost:3000/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionToken, actionCode: "FIND-USER" })
        });
        if (!actionResponse.ok) throw new Error('Error en la solicitud del token de acción.');
        const actionData = await actionResponse.json();
        const actionToken = actionData.actionToken;
        const findResponse = await fetch('http://localhost:3002/find', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionToken, actionToken })
        });
        if (!findResponse.ok) throw new Error('Error en la consulta de la cuenta.');
        const accountData = await findResponse.json();
        setUserData(accountData);
        setBalance(accountData.b_balance || 0);
      } catch (error) {
        console.error("Error fetching account data:", error);
      }
      try {
        const userActionResponse = await fetch('http://localhost:3000/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionToken, actionCode: "FIND-USER" })
        });
        if (!userActionResponse.ok) throw new Error('Error fetching user action token.');
        const userActionData = await userActionResponse.json();
        const userActionToken = userActionData.actionToken;
        const userResponse = await fetch('http://localhost:3000/findUser', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionToken, actionToken: userActionToken })
        });
        if (!userResponse.ok) throw new Error('Error fetching user data.');
        const userData = await userResponse.json();
        setUserName(userData.u_name || "User");
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };
    fetchData();
  }, [sessionToken]);

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:3000/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken })
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
        body: JSON.stringify({ sessionToken, actionCode: "FIND-USER" })
      });
      if (!actionResponse.ok) throw new Error('Error en la solicitud del token de acción.');
      const actionData = await actionResponse.json();
      const actionToken = actionData.actionToken;
      navigate("/update", { state: { sessionToken, actionToken } });
    } catch (error) {
      console.error('Error al obtener los datos del usuario:', error);
    }
  };

  const toggleSpotlight = (type) => {
    if (activeSpotlight === type) {
      setActiveSpotlight(null);
      if (type === "topUp") { setUserCards([]); setSelectedCard(null); }
      else if (type === "transaction") { setTransactionEmail(""); setTransactionAmount(""); }
      else if (type === "requestMoney") { setRequestMoneyEmail(""); setRequestMoneyAmount(""); setRequestMoneyMessage(""); }
    } else {
      setActiveSpotlight(type);
      if (type === "topUp") { setSelectedCard(null); fetchUserCards(); }
    }
  };

  const fetchUserCards = async () => {
    try {
      const actionResponse = await fetch('http://localhost:3000/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken, actionCode: "SEARCH-CARD" })
      });
      if (!actionResponse.ok) throw new Error('Error requesting search card action token.');
      const actionData = await actionResponse.json();
      const actionToken = actionData.actionToken;
      const searchResponse = await fetch('http://localhost:3002/searchCards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken, actionToken })
      });
      if (!searchResponse.ok) {
        const errorData = await searchResponse.json();
        throw new Error(errorData.message || "Error fetching cards.");
      }
      const cards = await searchResponse.json();
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
      const actionResponse = await fetch('http://localhost:3000/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken, actionCode: "ADD-TOP-UP" })
      });
      if (!actionResponse.ok) throw new Error('Error requesting top-up action token.');
      const actionData = await actionResponse.json();
      const actionToken = actionData.actionToken;
      const topUpResponse = await fetch('http://localhost:3002/topUp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken, actionToken, quantity: parseFloat(topUpAmount), card: selectedCard })
      });
      if (!topUpResponse.ok) {
        const errorData = await topUpResponse.json();
        alert("Error while adding top-up: " + errorData.message);
      } else {
        alert("Top-up added successfully.");
        setActiveSpotlight(null);
        setBalance(prev => prev + parseFloat(topUpAmount));
        setTopUpAmount("");
        setUserCards([]);
        setSelectedCard(null);
      }
    } catch (error) {
      console.error("Error while processing top-up:", error);
      alert("Error while processing top-up.");
    }
  };

  const handleCreditCardSubmit = async (e) => {
    e.preventDefault();
    try {
      const actionResponse = await fetch('http://localhost:3000/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken, actionCode: "CREATE-CARD" })
      });
      if (!actionResponse.ok) throw new Error('Error requesting create card action token.');
      const actionData = await actionResponse.json();
      const actionToken = actionData.actionToken;
      const createCardResponse = await fetch('http://localhost:3002/createCard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionToken,
          actionToken,
          card: { cc_number: creditCardNumber, cc_expirationDate: creditCardExpirationDate, cc_cvv: creditCardCVV }
        })
      });
      if (!createCardResponse.ok) {
        const errorData = await createCardResponse.json();
        alert("Error while creating card: " + errorData.message);
      } else {
        alert("Credit card created successfully.");
        setActiveSpotlight(null);
        setCreditCardNumber("");
        setCreditCardExpirationDate("");
        setCreditCardCVV("");
      }
    } catch (error) {
      console.error("Error while creating card:", error);
      alert("Error while creating card.");
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
      const actionResponse = await fetch('http://localhost:3000/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken, actionCode: "PERFORM-TRANSACTION" })
      });
      if (!actionResponse.ok) throw new Error('Error requesting transaction action token.');
      const actionData = await actionResponse.json();
      const actionToken = actionData.actionToken;
      const transactionResponse = await fetch('http://localhost:3002/performTransaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken, actionToken, email: transactionEmail, amount: parseFloat(transactionAmount) })
      });
      if (!transactionResponse.ok) {
        const errorData = await transactionResponse.json();
        alert("Error while performing transaction: " + errorData.error);
      } else {
        alert("Transaction performed successfully.");
        setActiveSpotlight(null);
        setBalance(prev => prev - parseFloat(transactionAmount));
        setTransactionEmail("");
        setTransactionAmount("");
      }
    } catch (error) {
      console.error("Error while processing transaction:", error);
      alert("Error while processing transaction.");
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
      const actionResponse = await fetch('http://localhost:3000/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken, actionCode: "PERFORM-TRANSACTION" })
      });
      if (!actionResponse.ok) throw new Error('Error requesting transaction action token.');
      const actionData = await actionResponse.json();
      const actionToken = actionData.actionToken;
      const requestMoneyResponse = await fetch('http://localhost:3002/requestMoney', {
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
      if (!requestMoneyResponse.ok) {
        const errorData = await requestMoneyResponse.json();
        alert("Error while requesting money: " + errorData.message);
      } else {
        alert("Money request sent successfully.");
        setActiveSpotlight(null);
        setRequestMoneyEmail("");
        setRequestMoneyAmount("");
        setRequestMoneyMessage("");
      }
    } catch (error) {
      console.error("Error while processing money request:", error);
      alert("Error while processing money request.");
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
        {activeSpotlight === "topUp" && (
          <div className="top-up-wrapper">
            <SpotlightCard className="custom-spotlight-card" spotlightColor="rgba(125, 36, 199, 0.81)">
              {!selectedCard ? (
                <>
                  <h2>Selecciona una tarjeta</h2>
                  <AnimatedList
                    items={userCards}
                    onItemSelect={(item, index) => { setSelectedCard(item); }}
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
