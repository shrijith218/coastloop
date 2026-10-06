import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import BottomNav from "../components/BottomNav";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [name, setName] = useState("Coast Guardian");
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setName(data.displayName || data.name || "Coast Guardian");
        setPoints(data.points ?? 0);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  async function handleLogout() {
    await signOut(auth);
    navigate("/login");
  }

  if (loading) {
    return (
      <main className="profile-page app-shell centered-page">
        <p className="page-loading-text">Loading profile...</p>
        <BottomNav active="profile" />
      </main>
    );
  }

  return (
    <main className="profile-page app-shell">
      <header className="simple-page-header">
        <div>
          <p className="page-kicker">COASTLOOP</p>
          <h1>Profile</h1>
        </div>
      </header>

      <section className="profile-card">
        <div className="profile-avatar">
          {name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h2>{name}</h2>
          <p>{points} EcoPoints • Protecting the coast, one action at a time.</p>
        </div>
      </section>

      <button
        type="button"
        className="logout-button"
        onClick={handleLogout}
      >
        Log out
      </button>

      <BottomNav active="profile" />
    </main>
  );
}