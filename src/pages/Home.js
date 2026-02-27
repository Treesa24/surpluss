import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import RestaurantDetail from "./RestaurantDetail";
import "./Home.css";

function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);

  useEffect(() => {
    // Only show items that have quantity > 0
    const q = query(collection(db, "listings"), where("quantity", ">", 0));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Group items by vendorId so they appear as one "Restaurant"
      const grouped = data.reduce((acc, item) => {
        if (!acc[item.vendorId]) {
          acc[item.vendorId] = { 
            name: item.vendorName || "LOCAL RESTAURANT", 
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

  // If a restaurant is clicked, show the Detail view
  if (selectedVendor) {
    return <RestaurantDetail vendor={selectedVendor} onBack={() => setSelectedVendor(null)} />;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>SURPLUS SAVER</h1>
        <div className="location-bar">CURRENT LOCATION: DOWNTOWN</div>
      </header>

      <div className="line thick" style={{backgroundColor: 'black', height: '6px', margin: '1rem 0'}}></div>
      
      <div className="restaurant-list">
        {restaurants.length > 0 ? (
          restaurants.map(res => (
            <div key={res.id} className="res-card" onClick={() => setSelectedVendor(res)}>
              <div className="res-img-alt">IMAGE_UNAVAILABLE</div>
              <div className="res-info">
                <h2>{res.name}</h2>
                <p>{res.items.length} ACTIVE SURPLUS OFFERS ↗</p>
              </div>
            </div>
          ))
        ) : (
          <p className="status-msg">SCANNING FOR SURPLUS...</p>
        )}
      </div>
    </div>
  );
}

export default Home;