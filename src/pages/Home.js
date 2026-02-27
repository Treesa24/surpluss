import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import "./Home.css";

function Home() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    // Reference the "listings" collection
    const q = query(collection(db, "listings"), orderBy("createdAt", "desc"));

    // Listen for real-time updates
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const itemsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setItems(itemsData);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>SURPLUS FEED</h1>
        <span>[ACTIVE OFFERS]</span>
      </header>

      <div className="line thick" style={{backgroundColor: 'black', height: '6px'}}></div>
      
      <div className="feed">
        {items.length > 0 ? (
          items.map(item => (
            <div key={item.id} className="item-card">
              <div className="item-details">
                <span className="shop-name">AVAILABLE NOW</span>
                <h2>{item.itemName}</h2>
                <p>COLLECT BY: {item.pickupTime}</p>
                <p className="price-tag">WAS: <strike>${item.originalPrice}</strike> | NOW: ${item.surplusPrice}</p>
              </div>
              <button className="reserve-btn">RESERVE</button>
            </div>
          ))
        ) : (
          <p style={{marginTop: '2rem', fontWeight: '800'}}>NO SURPLUS AVAILABLE CURRENTLY.</p>
        )}
      </div>
    </div>
  );
}

export default Home;