
import { useEffect, useState } from "react";
import { apiRequest, getItems } from "../service/api";

function Quality() {
  const [fabrics, setFabrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadQuality() {
      try {
        const data = await apiRequest("/quality");
        setFabrics(getItems(data));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadQuality();
  }, []);

  if (loading) return <p className="status">Loading quality fabrics...</p>;

  if (error) {
    return <p className="status error">Unable to load fabrics: {error}</p>;
  }

  return (
    <main className="collection-page">
      <p className="eyebrow">EVERYDAY COLLECTION</p>
      <h1>Quality Fabrics</h1>
      <p className="page-intro">
        Browse our quality fabric selection.
      </p>

      <div className="fabric-grid">
        {fabrics.map((fabric, index) => (
          <article className="fabric-card" key={fabric._id || fabric.id || index}>
            <div className="fabric-info">
              <span className="fabric-tier">{fabric.tier || "Quality"}</span>
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

      {fabrics.length === 0 && <p>No quality fabrics found.</p>}
    </main>
  );
}

export default Quality;
