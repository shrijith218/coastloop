import { useEffect, useState } from "react";
import { auth, db } from "../services/firebase";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import BottomNav from "../components/BottomNav";

export default function RewardsPage() {
  const [points, setPoints] = useState(0);
  const [level, setLevel] = useState("Silver");
  const [cleanups, setCleanups] = useState(0);
  const [plasticKg, setPlasticKg] = useState(0);
  const [sitesVisited, setSitesVisited] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      const userRef = doc(db, "users", user.uid);

      // Option 1: one-time fetch
      // const snap = await getDoc(userRef);
      // if (snap.exists()) {
      //   const data = snap.data();
      //   setPoints(data.points ?? 0);
      //   setCleanups(data.cleanups ?? 0);
      //   setPlasticKg(data.plasticKg ?? 0);
      //   setSitesVisited(data.sitesVisited ?? 0);
      // }

      // Option 2 (better): real-time sync
      const unsubscribe = onSnapshot(userRef, (snap) => {
        if (!snap.exists()) {
          setLoading(false);
          return;
        }
        const data = snap.data();
        setPoints(data.points ?? 0);
        setCleanups(data.cleanups ?? 0);
        setPlasticKg(data.plasticKg ?? 0);
        setSitesVisited(data.sitesVisited ?? 0);

        // Simple level logic (adjust as needed)
        if (data.points >= 500) setLevel("Gold");
        else if (data.points >= 200) setLevel("Bronze");
        else setLevel("Silver");

        setLoading(false);
      });

      return () => unsubscribe();
    });

    return () => unsub();
  }, []);

  if (loading) {
    return (
      <main className="rewards-page app-shell centered-page">
        <p className="page-loading-text">Loading your impact...</p>
        <BottomNav active="rewards" />
      </main>
    );
  }

  return (
    <main className="rewards-page app-shell">
      <header className="simple-page-header">
        <div>
          <p className="page-kicker">COASTLOOP</p>
          <h1>Your Impact</h1>
        </div>
      </header>

      <section className="impact-summary-card">
        <div>
          <span>Your Impact</span>
          <strong>{points}</strong>
          <small>EcoPoints</small>
        </div>
        <div className="impact-level">
          <span>Level</span>
          <strong>{level}</strong>
          <span className="level-icon">★</span>
        </div>
      </section>

      <h2 className="content-section-title">This Month</h2>
      <section className="impact-stat-grid">
        <article>
          <span>♻</span>
          <strong>{cleanups}</strong>
          <small>Cleanups</small>
        </article>
        <article>
          <span>◌</span>
          <strong>{plasticKg} kg</strong>
          <small>Plastic Prevented</small>
        </article>
        <article>
          <span>⌖</span>
          <strong>{sitesVisited}</strong>
          <small>Sites Visited</small>
        </article>
      </section>

      <BottomNav active="rewards" />
    </main>
  );
}