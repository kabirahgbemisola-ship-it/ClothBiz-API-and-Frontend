
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../service/api";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiRequest("/customer/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const token =
        data.accessToken ||
        data.access_token ||
        data.token ||
        data.data?.accessToken ||
        data.data?.token;

      if (token) {
        sessionStorage.setItem("accessToken", token);
      }

      const refreshToken =
        data.refreshToken ||
        data.refresh_token ||
        data.data?.refreshToken;

      if (refreshToken) {
        sessionStorage.setItem("refreshToken", refreshToken);
      }

      navigate("/profile");
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="eyebrow">WELCOME BACK</p>
        <h1>Customer Login</h1>
        <p>Log in to access your account and premium collection.</p>

        {error && <p className="error">{error}</p>}

        <label htmlFor="email">Email address</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
        />

        <button className="primary-btn full-btn" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </main>
  );
}

export default Login;
