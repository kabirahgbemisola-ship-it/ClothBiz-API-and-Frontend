import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        KamrahafVentura
      </Link>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/shop">Shop</Link>
        <Link to="/premium">Premium</Link>
        <Link to="/quality">Quality</Link>
      </div>

      <div className="nav-auth">
        <Link to="/login" className="login-link">
          Login
        </Link>

        <Link to="/register" className="register-btn">
          Create Account
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;