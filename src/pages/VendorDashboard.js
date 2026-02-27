import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  deleteDoc 
} from "firebase/firestore";
import "./VendorDashboard.css";

function VendorDashboard() {
  const [itemName, setItemName] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [surplusPrice, setSurplusPrice] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [myListings, setMyListings] = useState([]);

  // Fetch only the listings created by THIS vendor
  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "listings"),
      where("vendorId", "==", auth.currentUser.uid)
    );

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
        itemName: itemName.toUpperCase(),
        originalPrice: originalPrice,
        surplusPrice: surplusPrice,
        pickupTime: pickupTime,
        createdAt: serverTimestamp(),
      });
      setItemName(""); setOriginalPrice(""); setSurplusPrice(""); setPickupTime("");
    } catch (error) {
      alert("Error listing item.");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Mark as sold or remove listing?");
    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, "listings", id));
      } catch (error) {
        alert("Error deleting item.");
      }
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>VENDOR TERMINAL</h1>
        <div className="status-badge">LIVE 🟢</div>
      </header>

      <section className="listing-section">
        <div className="line thick" style={{backgroundColor: 'black', height: '6px'}}></div>
        <h3>Post Surplus Food</h3>
        <form className="post-form" onSubmit={handlePost}>
          <input type="text" placeholder="ITEM NAME" value={itemName} onChange={(e) => setItemName(e.target.value)} required />
          <div className="form-row">
            <input type="text" placeholder="ORG. PRICE" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} required />
            <input type="text" placeholder="SURPLUS PRICE" value={surplusPrice} onChange={(e) => setSurplusPrice(e.target.value)} required />
          </div>
          <input type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} required />
          <button type="submit" className="post-btn">LIST ITEM FOR PICKUP ↗</button>
        </form>
      </section>

      <section className="active-listings" style={{marginTop: '3rem'}}>
        <div className="line thin" style={{backgroundColor: 'black', height: '1px'}}></div>
        <h3>Your Live Offers</h3>
        {myListings.map(item => (
          <div key={item.id} className="food-card" style={{border: '2px solid black', padding: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div>
              <h4 style={{margin: 0}}>{item.itemName}</h4>
              <p style={{fontSize: '0.8rem', margin: 0}}>PRICE: ${item.surplusPrice} | TIME: {item.pickupTime}</p>
            </div>
            <button 
              onClick={() => handleDelete(item.id)}
              style={{background: 'black', color: 'white', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 'bold'}}
            >
              DELETE
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}

export default VendorDashboard;