import React, { useState, useEffect } from "react";
import './updateUser.css';
import { countries } from '../utils/countries';
import { useLocation, useNavigate } from 'react-router-dom';

const UpdateProfile = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const token = state?.token;
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
                const requestData = {
                    dni: "12345678A",
                    sessionToken: token,
                    actionToken: "653dec60ed22edacf2b4df03a977808d70abf939"
                };
                const response = await fetch("/findUser", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestData)
                });

                if (response.ok) {
                    const data = await response.json();
                    setDni(data.u_dni);
                    setName(data.u_name);
                    setLastName(data.u_lastName);
                    setAge(data.u_age);
                    setAddress(data.u_address);
                    setCountry(data.u_country);
                    setEmail(data.u_email);
                } else {
                    alert("Error while retrieving user data.");
                }
            } catch (error) {
                console.error("Error while retrieving user data:", error);
                alert("Error while retrieving user data");
            }
        };

        fetchUserData();
    }, [token]);

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

        const payload = {
            dni,
            name,
            lastName,
            age: parseInt(age, 10),
            email,
            address,
            country
        };

        try {
            const token = localStorage.getItem("token");
            const response = await fetch("/update", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert("Data updated successfully.");
                navigate("/profile");
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
                // Petición para eliminar la cuenta
                const response = await fetch("/deleteAccount", {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    alert("Cuenta eliminada exitosamente.");
                    // Redirige o realiza otra acción tras eliminar la cuenta
                    navigate("/");
                } else {
                    const errorData = await response.json();
                    alert("Error al eliminar la cuenta: " + errorData.message);
                }

                // Aquí puedes configurar otra llamada al backend si es necesario
                // await fetch("/otraLlamada", { ... });

            } catch (error) {
                console.error("Error al eliminar la cuenta", error);
                alert("Error al eliminar la cuenta.");
            }
        } else {
            alert("La frase introducida es incorrecta.");
        }
    };

    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <div className="update-page">
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
