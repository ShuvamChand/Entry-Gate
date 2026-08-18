import { useState } from "react";
import ADMINS from "../Admin/Admins";
import "./LoginPage.css";

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();

    const matchedAdmin = ADMINS.find(
      (admin) => admin.email.toLowerCase() === trimmedEmail,
    );

    if (!matchedAdmin) {
      setError("This email is not registered as an admin.");
      return;
    }

    if (matchedAdmin.password !== password) {
      setError("Incorrect password. Please try again.");
      return;
    }

    setError("");
    onLogin(matchedAdmin);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Admin Login</h1>
        <p className="login-subtitle">
          Sign in to access the Vehicle Entry System
        </p>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <label className="login-field">
            <span className="login-label">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="username"
            />
          </label>

          <label className="login-field">
            <span className="login-label">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </label>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-btn">
            Log In
          </button>
        </form>

        <p className="login-footer">Authorized personnel only.</p>
      </div>
    </div>
  );
}
