
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../service/api";

function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await apiRequest("/customer/me");
        const customer = data.customer || data.user || data.data || data;

        setProfile(customer);
        setName(customer.name || customer.fullName || "");
        setEmail(customer.email || "");
      } catch (err) {
        setError(err.message || "Please log in to view your profile.");
      }
    }

    loadProfile();
  }, []);

  async function updateProfile(e) {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const data = await apiRequest("/customer/me", {
        method: "PATCH",
        body: JSON.stringify({ name, email }),
      });

      const customer = data.customer || data.user || data.data;

      if (customer) setProfile(customer);

      setMessage(data.message || "Profile update request completed.");
    } catch (err) {
      setError(err.message);
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const data = await apiRequest("/customer/me/password", {
        method: "PATCH",
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      setMessage(data.message || "Password change request completed.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function logout() {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout request failed:", err.message);
    } finally {
      sessionStorage.removeItem("accessToken");
      navigate("/login");
    }
  }

  if (error && !profile) {
    return (
      <main className="collection-page">
        <h1>My Profile</h1>
        <p className="error">{error}</p>
        <Link className="primary-btn" to="/login">Go to Login</Link>
      </main>
    );
  }

  if (!profile) {
    return <p className="status">Loading profile...</p>;
  }

  return (
    <main className="profile-page">
      <h1>My Profile</h1>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <form className="profile-card" onSubmit={updateProfile}>
        <h2>Personal Information</h2>

        <label htmlFor="name">Full name</label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label htmlFor="email">Email address</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button className="primary-btn">Save Changes</button>
      </form>

      <form className="profile-card" onSubmit={changePassword}>
        <h2>Change Password</h2>

        <label htmlFor="currentPassword">Current password</label>
        <input
          id="currentPassword"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />

        <label htmlFor="newPassword">New password</label>
        <input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          minLength={8}
          required
        />

        <button className="primary-btn">Change Password</button>
      </form>

      <button className="logout-btn" onClick={logout}>Logout</button>
    </main>
  );
}

export default Profile;
