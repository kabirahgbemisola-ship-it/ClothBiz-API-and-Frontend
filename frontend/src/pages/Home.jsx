
import { Link } from "react-router-dom";

function Home() {
  return (
    <main>
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">WELCOME TO KamrahafVentura</p>
          <h1>Find the fabric/cloth that matches your story.</h1>
          <p>
            Explore beautiful fabrics for your next outfit,
            special occasion, or creative project.
          </p>

          <div className="hero-buttons">
            <Link to="/shop" className="primary-btn">
              Explore Collection
            </Link>
            <Link to="/quality" className="secondary-btn">
              Shop Quality Fabrics
            </Link>
          </div>
        </div>
      </section>

      <section className="home-categories">
        <div>
          <span>01</span>
          <h2>Quality Fabrics</h2>
          <p>Discover fabrics for everyday creativity.</p>
          <Link to="/quality">Explore quality →</Link>
        </div>

        <div>
          <span>02</span>
          <h2>Premium Collection</h2>
          <p>Explore our premium fabric selection.</p>
          <Link to="/premium">Explore premium →</Link>
        </div>

        <div>
          <span>03</span>
          <h2>Our Collection</h2>
          <p>Browse the fabrics available in our store.</p>
          <Link to="/shop">Shop all fabrics →</Link>
        </div>
      </section>
    </main>
  );
}

export default Home;
