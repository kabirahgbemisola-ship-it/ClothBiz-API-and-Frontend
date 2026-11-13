
import { useEffect, useState } from "react";
import { apiRequest, getItems } from "../service/api";

function Shop() {
  const [fabrics, setFabrics] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadFabrics() {
      try {
        const data = await apiRequest("/all");
        console.log("Fabric API response:", data);
        setFabrics(getItems(data));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadFabrics();
  }, []);

  const filteredFabrics = fabrics.filter((fabric) => {
    const text = [
      fabric.fabricname,
      fabric.name,
      fabric.fabricName,
      fabric.typeMaterial,
      fabric.material,
      fabric.color,
      fabric.tier,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return text.includes(search.toLowerCase());
  });

  if (loading) return <p className="status">Loading fabrics...</p>;

  if (error) {
    return <p className="status error">Unable to load fabrics: {error}</p>;
  }

  return (
    <main className="collection-page">
      <p className="eyebrow">OUR COLLECTION</p>
      <h1>Explore Our Fabrics</h1>
      <p className="page-intro">
        Find fabrics that suit your style and creativity.
      </p>

      <input
        className="search-input"
        type="search"
        placeholder="Search by name, material, color or tier..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filteredFabrics.length === 0 ? (
        <p className="status">
          No fabrics found. Try another search.
        </p>
      ) : (
        <div className="fabric-grid">
          {filteredFabrics.map((fabric, index) => (
            <article
              className="fabric-card"
              key={fabric._id || fabric.id || index}
            >
              {fabric.image && (
                <img
                  className="fabric-image"
                  src={fabric.image}
                  alt={fabric.name || "Fabric"}
                />
              )}

              <div className="fabric-info">
                <span className="fabric-tier">
                  {fabric.tier || "Fabric"}
                </span>

                <h2>
                  {fabric.fabricname || fabric.name || fabric.fabricName || "Fabric"}
                </h2>

                <p>Material: {fabric.typeMaterial || fabric.material || "Not specified"}</p>
                <p>Color: {fabric.color || "Not specified"}</p>

                <p className="fabric-price">
                  {fabric.pricePerYard != null
                    ? `₦${Number(fabric.pricePerYard).toLocaleString()}/yd`
                    : fabric.price != null
                      ? `₦${Number(fabric.price).toLocaleString()}`
                      : "Price unavailable"}
                </p>

                <p className="stock-status">
                  {fabric.isInStock != null
                    ? fabric.isInStock
                      ? "In stock"
                      : "Out of stock"
                    : fabric.stock != null
                      ? Number(fabric.stock) > 0
                        ? "In stock"
                        : "Out of stock"
                      : fabric.available != null
                        ? fabric.available
                          ? "Available"
                          : "Unavailable"
                        : ""}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

export default Shop;
