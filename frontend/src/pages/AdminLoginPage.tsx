import React, { useState } from "react";
import { loginAdmin } from "../api/admin";
import { useAuth } from "../context/AuthContext";

export const AdminLoginPage: React.FC = () => {
  const { login } = useAuth();
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput || !passwordInput) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await loginAdmin(usernameInput, passwordInput);
      login(res.access_token, usernameInput);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Incorrect credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="panel login-card">
        <div className="login-brand">
          <div className="brand-icon">🎟️</div>
          <div className="brand-name" style={{ fontSize: "1.4rem", fontWeight: 800 }}>
            Antigravity Events
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
            Administration Portal
          </p>
        </div>

        <h2 style={{ marginBottom: "1.5rem", textAlign: "center", fontSize: "1.25rem" }}>
          Sign In
        </h2>

        {error && <div className="alert-box alert-warning">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              className="form-control"
              placeholder="e.g. admin"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "1rem" }}
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Sign In to Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
};
export default AdminLoginPage;
