
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest, getItems } from "../service/api";

function Premium() {
  const [fabrics, setFabrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPremium() {
      try {
        const data = await apiRequest("/premium");
        setFabrics(getItems(data));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadPremium();
  }, []);

  if (loading) return <p className="status">Loading premium fabrics...</p>;

  if (error) {
    return (
      <main className="collection-page">
        <h1>Premium Collection</h1>
        <p className="error">{error}</p>
        <p>Please log in with your customer account to access this collection.</p>
        <Link to="/login" className="primary-btn">Login</Link>
      </main>
    );
  }

  return (
    <main className="collection-page">
      <p className="eyebrow">EXCLUSIVE SELECTION</p>
      <h1>Premium Fabrics</h1>

      <div className="fabric-grid">
        {fabrics.map((fabric, index) => (
          <article className="fabric-card" key={fabric._id || fabric.id || index}>
            <div className="fabric-info">
              <span className="fabric-tier">{fabric.tier || "Premium"}</span>
              <h2>{fabric.fabricname || fabric.name || fabric.fabricName || "Fabric"}</h2>
              <p>Material: {fabric.typeMaterial || fabric.material || "Not specified"}</p>
              <p>Color: {fabric.color || "Not specified"}</p>
              <p className="fabric-price">
                {fabric.pricePerYard != null
                  ? `₦${Number(fabric.pricePerYard).toLocaleString()}/yd`
                  : fabric.price != null
                    ? `₦${Number(fabric.price).toLocaleString()}`
                    : "Price unavailable"}
              </p>
            </div>
          </article>
        ))}
      </div>

      {fabrics.length === 0 && <p>No premium fabrics found.</p>}
    </main>
  );
}

export default Premium;
