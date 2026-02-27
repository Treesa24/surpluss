import { db } from "../firebase";
import { doc, runTransaction } from "firebase/firestore";
import "./Home.css"; // Reuse Home styles or create Detail.css

function RestaurantDetail({ vendor, onBack }) {
  
  const handleReserve = async (itemId) => {
    const itemRef = doc(db, "listings", itemId);

    try {
      await runTransaction(db, async (transaction) => {
        const itemDoc = await transaction.get(itemRef);
        if (!itemDoc.exists()) throw "Item no longer exists.";

        const newQuantity = itemDoc.data().quantity - 1;

        if (newQuantity >= 0) {
          transaction.update(itemRef, { quantity: newQuantity });
        } else {
          throw "OUT OF STOCK!";
        }
      });
      alert("RESERVATION SECURED. PICKUP BEFORE WINDOW CLOSES.");
    } catch (e) {
      alert("Error: " + e);
    }
  };

  return (
    <div className="app-container">
      <button className="back-btn" onClick={onBack}>← RETURN TO FEED</button>
      
      <div className="res-header">
        <h1 className="big-title">{vendor.name}</h1>
        <p className="res-meta">AUTHORIZED SURPLUS PROVIDER</p>
      </div>

      <div className="line thin" style={{backgroundColor: 'black', height: '1px', margin: '2rem 0'}}></div>

      <div className="menu-container">
        {vendor.items.map(item => (
          <div key={item.id} className="menu-item-row">
            <div className="item-main">
              <h3>{item.itemName}</h3>
              <p className="pickup-time">PICKUP BY: {item.pickupTime}</p>
              <div className="price-box">
                 <span className="current-price">${item.surplusPrice}</span>
                 <strike className="old-price">${item.originalPrice}</strike>
              </div>
            </div>
            
            <div className="action-area">
              <span className="qty-badge">{item.quantity} LEFT</span>
              <button 
                className="reserve-btn-v2"
                onClick={() => handleReserve(item.id)}
                disabled={item.quantity <= 0}
              >
                {item.quantity > 0 ? "RESERVE +" : "SOLD OUT"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RestaurantDetail;