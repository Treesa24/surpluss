import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { 
  collection, addDoc, serverTimestamp, query, 
  where, onSnapshot, doc, deleteDoc 
} from "firebase/firestore";
import "./VendorDashboard.css";

function VendorDashboard() {
  const [resName, setResName] = useState("");
  const [category, setCategory] = useState("General");
  const [itemName, setItemName] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [surplusPrice, setSurplusPrice] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [myListings, setMyListings] = useState([]);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(collection(db, "listings"), where("vendorId", "==", auth.currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMyListings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "listings"), {
        vendorId: auth.currentUser.uid,
        vendorName: resName.toUpperCase(),
        category: category.toUpperCase(),
        itemName: itemName.toUpperCase(),
        originalPrice,
        surplusPrice,
        pickupTime,
        quantity: parseInt(quantity),
        createdAt: serverTimestamp(),
      });
      // Clear item fields but keep Restaurant Name for convenience
      setItemName(""); setOriginalPrice(""); setSurplusPrice(""); setPickupTime(""); setQuantity(1);
    } catch (err) { alert("Post Failed"); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("CONFIRM: REMOVE FROM MARKETPLACE?")) {
      await deleteDoc(doc(db, "listings", id));
    }
  };

  return (
    <div className="vendor-container">
      <header className="vendor-header">
        <div className="header-top">
          <span className="system-status">SYSTEM_ACTIVE</span>
          <span className="user-id">{auth.currentUser?.email}</span>
        </div>
        <h1>VENDOR_TERMINAL_v1.0</h1>
      </header>

      <div className="layout-grid">
        {/* LEFT SIDE: INPUT FORM */}
        <section className="form-section">
          <h2 className="section-label">01. ESTABLISHMENT DETAILS</h2>
          <div className="input-box">
            <label>RESTAURANT NAME</label>
            <input type="text" placeholder="E.G. OAK & BERRY" value={resName} onChange={(e) => setResName(e.target.value)} required />
          </div>
          <div className="input-box">
            <label>CATEGORY</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="Bakery">BAKERY</option>
              <option value="Restaurant">RESTAURANT</option>
              <option value="Cafe">CAFE</option>
              <option value="Quick Bites">QUICK BITES</option>
            </select>
          </div>

          <h2 className="section-label" style={{marginTop: '2rem'}}>02. SURPLUS DATA</h2>
          <form className="vendor-form" onSubmit={handlePost}>
            <input type="text" placeholder="ITEM NAME (E.G. VEG PLATTER)" value={itemName} onChange={(e) => setItemName(e.target.value)} required />
            <div className="form-row">
              <input type="number" placeholder="ORG. PRICE" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} required />
              <input type="number" placeholder="OFFER PRICE" value={surplusPrice} onChange={(e) => setSurplusPrice(e.target.value)} required />
            </div>
            <div className="form-row">
               <input type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} required />
               <input type="number" placeholder="QTY" value={quantity} onChange={(e) => setQuantity(e.target.value)} required min="1" />
            </div>
            <button type="submit" className="mega-post-btn">PUSH TO LIVE MARKET ↗</button>
          </form>
        </section>

        {/* RIGHT SIDE: LIVE LISTINGS */}
        <section className="live-feed-section">
          <h2 className="section-label">03. LIVE_INVENTORY</h2>
          <div className="inventory-grid">
            {myListings.length > 0 ? myListings.map(item => (
              <div key={item.id} className="inventory-card">
                <div className="card-top">
                  <span className="qty-tag">x{item.quantity}</span>
                  <span className="time-tag">{item.pickupTime}</span>
                </div>
                <h3>{item.itemName}</h3>
                <div className="card-footer">
                  <span className="price-info">${item.surplusPrice}</span>
                  <button onClick={() => handleDelete(item.id)} className="del-btn">REMOVE</button>
                </div>
              </div>
            )) : <p className="empty-msg">NO ACTIVE LISTINGS FOUND</p>}
          </div>
        </section>
      </div>
    </div>
  );
}

export default VendorDashboard;