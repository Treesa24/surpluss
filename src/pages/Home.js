import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import RestaurantDetail from "./RestaurantDetail";
import "./Home.css";

function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "listings"), where("quantity", ">", 0));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const grouped = data.reduce((acc, item) => {
        if (!acc[item.vendorId]) {
          acc[item.vendorId] = { 
            name: item.vendorName || "LOCAL_ESTABLISHMENT", 
            category: item.category || "GENERAL",
            id: item.vendorId, 
            items: [] 
          };
        }
        acc[item.vendorId].items.push(item);
        return acc;
      }, {});
      
      setRestaurants(Object.values(grouped));
    });

    return () => unsubscribe();
  }, []);

  if (selectedVendor) {
    return <RestaurantDetail vendor={selectedVendor} onBack={() => setSelectedVendor(null)} />;
  }

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-meta">
          <span>SURPLUS_OS_v1.0</span>
          <span>FEBRUARY_2026</span>
        </div>
        <h1 className="main-logo">SURPLUS_SAVER</h1>
        <div className="location-strip">
          <span className="location-dot"></span>
          ACTIVE_IN: KOCHI, KERALA
        </div>
      </header>

      <div className="filter-bar">
        <button className="filter-pill active">ALL_OFFERS</button>
        <button className="filter-pill">BAKERY</button>
        <button className="filter-pill">RESTAURANTS</button>
        <button className="filter-pill">CAFES</button>
      </div>

      <main className="restaurant-grid">
        {restaurants.length > 0 ? (
          restaurants.map(res => (
            <div key={res.id} className="res-card-v2" onClick={() => setSelectedVendor(res)}>
              <div className="res-visual">
                 <span className="res-category-tag">{res.category}</span>
                 <div className="visual-pattern"></div>
              </div>
              
              <div className="res-details">
                <div className="res-title-row">
                  <h2>{res.name}</h2>
                  <span className="arrow-icon">↗</span>
                </div>
                <div className="res-meta-row">
                  <span className="offer-count">{res.items.length} ACTIVE BUNDLES</span>
                  <span className="dist-tag">0.8 KM</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>SYNCHRONIZING_LIVE_DATA...</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default Home;