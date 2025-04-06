import React, { useState, useNavigate, useLocation } from "react";
import Threads from "./Threads";
import Dock from "./Dock";
import { GoHome, GoPerson, GoGear } from "react-icons/go";
import "./adminDashboard.css";

const AdminDashboard = () => {
  const [activeComponent, setActiveComponent] = useState("overview");
  const navigate = useNavigate();
  const { state } = useLocation();
  const sessionToken = state?.token;

  const renderContent = () => {
    switch (activeComponent) {
      case "overview":
        return (
          <div className="content">
            <h1>Overview</h1>
            <p>Resumen de la actividad reciente y métricas.</p>
          </div>
        );
      case "users":
        return (
          <div className="content">
            <h1>Usuarios</h1>
            <p>Gestión de usuarios y roles.</p>
          </div>
        );
      case "settings":
        return (
          <div className="content">
            <h1>Configuración</h1>
            <p>Ajustes del sistema y preferencias.</p>
          </div>
        );
      default:
        return (
          <div className="content">
            <h1>Dashboard</h1>
          </div>
        );
    }
  };

  const dockItems = [
    {
      icon: <GoHome size={24} />,
      label: "Overview",
      onClick: () => setActiveComponent("overview"),
    },
    {
      icon: <GoPerson size={24} />,
      label: "Usuarios",
      onClick: () => setActiveComponent("users"),
    },
    {
      icon: <GoGear size={24} />,
      label: "Configuración",
      onClick: () => setActiveComponent("settings"),
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
