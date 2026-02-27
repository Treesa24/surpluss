import { db } from "../firebase";
import { doc, runTransaction } from "firebase/firestore";
import "./Home.css"; // Uses shared Home styles for consistency

function RestaurantDetail({ vendor, onBack }) {
  
  const handleReserve = async (itemId, itemName) => {
    const itemRef = doc(db, "listings", itemId);

    try {
      await runTransaction(db, async (transaction) => {
        const itemDoc = await transaction.get(itemRef);
        if (!itemDoc.exists()) throw "OFFER_EXPIRED";

        const newQuantity = itemDoc.data().quantity - 1;

        if (newQuantity >= 0) {
          transaction.update(itemRef, { quantity: newQuantity });
        } else {
          throw "STOCK_DEPLETED";
        }
      });
      alert(`SUCCESS: ${itemName} RESERVED. SHOW CODE AT CHECKOUT.`);
    } catch (e) {
      alert("ERROR: " + e);
    }
  };

  return (
    <div className="home-container detail-view">
      {/* Navigation Header */}
      <nav className="detail-nav">
        <button className="back-pill" onClick={onBack}>← RETURN_TO_FEED</button>
        <span className="nav-id">RES_ID: {vendor.id.slice(0, 6)}</span>
      </nav>

      <header className="res-profile">
        <div className="category-pill">{vendor.category}</div>
        <h1 className="res-name-title">{vendor.name}</h1>
        <div className="res-stats">
          <div className="stat-block">
             <span className="label">PICKUP_ZONE</span>
             <span className="value">COUNTER_01</span>
          </div>
          <div className="stat-block">
             <span className="label">RATING</span>
             <span className="value">4.8★</span>
          </div>
        </div>
      </header>

      <div className="line thick" style={{backgroundColor: 'black', height: '6px', margin: '1.5rem 0'}}></div>

      <section className="menu-section">
        <h3 className="section-header">ACTIVE_SURPLUS_BUNDLES</h3>
        
        {vendor.items.map(item => (
          <div key={item.id} className={`menu-item-v2 ${item.quantity === 0 ? 'sold-out' : ''}`}>
            <div className="item-main-info">
              <div className="item-header-row">
                <h3>{item.itemName}</h3>
                <span className="qty-counter">{item.quantity} LEFT</span>
              </div>
              <p className="item-subtext">COLLECTION_WINDOW: {item.pickupTime}</p>
              
              <div className="price-container">
                <span className="deal-price">${item.surplusPrice}</span>
                <span className="original-price">${item.originalPrice}</span>
                <span className="discount-tag">
                  -{Math.round((1 - item.surplusPrice / item.originalPrice) * 100)}%
                </span>
              </div>
            </div>

            <button 
              className="action-trigger"
              onClick={() => handleReserve(item.id, item.itemName)}
              disabled={item.quantity <= 0}
            >
              {item.quantity > 0 ? "RESERVE +" : "EXPIRED"}
            </button>
          </div>
        ))}
      </section>

      <footer className="detail-footer">
        <p>RESERVATION SECURES ITEM FOR 30 MINUTES</p>
      </footer>
    </div>
  );
}

export default RestaurantDetail;