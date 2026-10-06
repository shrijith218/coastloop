import { useEffect, useState } from "react";
import { auth, db } from "../services/firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import BottomNav from "../components/BottomNav";

export default function ActivityPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, "users", user.uid, "activities"),
        orderBy("timestamp", "desc"),
        limit(50)
      );

      const unsubscribe = onSnapshot(q, (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setActivities(list);
        setLoading(false);
      });

      return () => unsubscribe();
    });

    return () => unsub();
  }, []);

  if (loading) {
    return (
      <main className="activity-page app-shell centered-page">
        <p className="page-loading-text">Loading activity...</p>
        <BottomNav active="activity" />
      </main>
    );
  }

  return (
    <main className="activity-page app-shell">
      <header className="simple-page-header">
        <div>
          <p className="page-kicker">COASTLOOP</p>
          <h1>Activity</h1>
        </div>
      </header>

      {activities.length === 0 ? (
        <section className="empty-state-card">
          <div className="empty-state-icon">◌</div>
          <h2>No activity yet</h2>
          <p>
            Your cleanups and scans will appear here once you start using CoastLoop.
          </p>
        </section>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {activities.map((a) => (
            <li
              key={a.id}
              style={{
                border: "1px solid var(--border)",
                borderRadius: "16px",
                padding: "14px",
                background: "var(--white)",
                marginBottom: "10px",
              }}
            >
              <div style={{ fontWeight: 800, color: "var(--deep-ocean)" }}>
                {a.type || "Cleanup"}
              </div>
              <div style={{ fontSize: 13, color: "var(--muted)" }}>
                {a.points ? `+${a.points} pts` : ""}{" "}
                {a.timestamp?.toDate ? a.timestamp.toDate().toLocaleString() : ""}
              </div>
            </li>
          ))}
        </ul>
      )}

      <BottomNav active="activity" />
    </main>
  );
}