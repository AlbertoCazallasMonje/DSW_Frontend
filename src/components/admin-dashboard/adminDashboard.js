import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Threads from "./Threads";
import Dock from "./Dock";
import AnimatedList from "./AnimatedList";
import { FaUsers, FaExchangeAlt } from "react-icons/fa";
import "./adminDashboard.css";

const AdminDashboard = () => {

  const [activeComponent, setActiveComponent] = useState("users");
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const navigate = useNavigate();
  const { state } = useLocation();
  const sessionToken = state?.token;

  const getActionToken = async (actionCode) => {
    try {
      const actionRes = await fetch('http://localhost:3000/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken, actionCode })
      });
      if (!actionRes.ok) throw new Error('Error solicitando token de acción.');
      const actionData = await actionRes.json();
      return actionData.actionToken;
    } catch (error) {
      console.error("Error fetching action token:", error);
      throw error;
    }
  };

  const fetchUsers = async () => {
    try {
      const actionToken = await getActionToken("ADMIN-LOAD-USERS");
      const res = await fetch('http://localhost:3000/adminLoadUsers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken, actionToken })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al cargar usuarios");
      setUsers(data);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      alert("Error al cargar usuarios: " + error.message);
    }
  };

  const fetchTransactions = async () => {
    try {
      const actionToken = await getActionToken("ADMIN-LOAD-TRANSACTIONS");
      const res = await fetch('http://localhost:3002/adminLoadTransactionDetails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken, actionToken })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al cargar transacciones");
      setTransactions(data.transactions);
    } catch (error) {
      console.error("Error al cargar transacciones:", error);
      alert("Error al cargar transacciones: " + error.message);
    }
  };

  useEffect(() => {
    if (activeComponent === "users") {
      fetchUsers();
    } else if (activeComponent === "transactions") {
      fetchTransactions();
    }
  }, [activeComponent, sessionToken]);

  const renderContent = () => {
    if (activeComponent === "users") {
      return (
        <div className="content">
          <h1>Usuarios</h1>
          {users && users.length > 0 ? (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <AnimatedList
                items={users.map(user =>
                  `${user.u_name} ${user.u_lastName} - ${user.u_email} - ${user.is_admin ? "Admin" : "User"}`
                )}
              />
            </div>
          ) : (
            <p>No se encontraron usuarios.</p>
          )}
        </div>
      );
    } else if (activeComponent === "transactions") {
      return (
        <div className="content">
          <h1>Transacciones</h1>
          {transactions && transactions.length > 0 ? (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <AnimatedList
                items={transactions.map(txn =>
                  `ID: ${txn.t_id} | Remitente: ${txn.dni_sender} | Destinatario: ${txn.dni_receiver} | Monto: ${txn.amount} | Estado: ${txn.t_state} | Fecha: ${new Date(txn.t_date).toLocaleString()}`
                )}
              />
            </div>
          ) : (
            <p>No se encontraron transacciones.</p>
          )}
        </div>
      );
    }
  };

  const dockItems = [
    {
      icon: <FaUsers size={24} />,
      label: "Usuarios",
      onClick: () => setActiveComponent("users"),
    },
    {
      icon: <FaExchangeAlt size={24} />,
      label: "Transacciones",
      onClick: () => setActiveComponent("transactions"),
    },
  ];

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

  return (
    <div className="admin-dashboard">
      <Threads
        className="dashboard-background"
        color={[1, 1, 1]}
        amplitude={1}
        distance={0.5}
        enableMouseInteraction={false}
      />

      <div className="dashboard-overlay">
        <header className="dashboard-header">
          <h2>Admin Dashboard</h2>
          <button onClick={handleLogout} className="logout-button">
            Cerrar Sesión
          </button>
        </header>

        <div className="dashboard-content">
          {renderContent()}
        </div>

        <div className="dashboard-dock">
          <Dock items={dockItems} magnification={50} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
