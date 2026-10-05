import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../services/firebase";
import BottomNav from "../components/BottomNav";
import mockRewards from "../data/mockRewards";

export default function RewardsPage() {
  const navigate = useNavigate();

  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/login");
        return;
      }

      try {
        const userDocument = await getDoc(doc(db, "users", currentUser.uid));

        if (userDocument.exists()) {
          setUserProfile(userDocument.data());
        }
      } catch (error) {
        console.error("Unable to load rewards profile:", error);
        setMessage("Unable to load your reward balance.");
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  function handleRedeem(reward) {
    if (!userProfile) return;

    if (userProfile.ecoPoints < reward.points) {
      setMessage(
        `You need ${reward.points - userProfile.ecoPoints} more EcoPoints for this reward.`,
      );
      return;
    }

    setMessage(
      `Demo reward unlocked: ${reward.title}. In production, this creates a secure voucher code.`,
    );
  }

  if (isLoading) {
    return (
      <main className="app-page loading-page">
        <p>Loading your rewards...</p>
      </main>
    );
  }

  const points = userProfile?.ecoPoints || 0;
  const nextReward = mockRewards.find((reward) => reward.points > points);

  return (
    <main className="app-shell">
  <header className="simple-page-header">
    <h1>Your Impact</h1>
    <button className="header-icon-button">⋮</button>
  </header>

  <section className="impact-card">
    <div>
      <p>Total impact</p>
      <strong>{userProfile?.ecoPoints || 0}</strong>
      <span>Points</span>
    </div>

    <div className="level-badge">
      <span>Level</span>
      <strong>Silver</strong>
      <span>◈</span>
    </div>
  </section>

  <h2 className="section-title">This Month</h2>

  <section className="impact-stat-grid">
    <article>
      <span>♙</span>
      <strong>12</strong>
      <small>Cleanups</small>
    </article>

    <article>
      <span>♧</span>
      <strong>24.3 kg</strong>
      <small>Plastic Prevented</small>
    </article>

    <article>
      <span>⌾</span>
      <strong>5</strong>
      <small>Sites Visited</small>
    </article>
  </section>

  <section className="badge-section">
    <div className="section-heading">
      <h2>Recent Badges</h2>
      <button>View all</button>
    </div>

    <div className="badge-row">
      <div className="badge-circle">♻</div>
      <div className="badge-circle">◈</div>
      <div className="badge-circle">QR</div>
      <div className="badge-circle">★</div>
    </div>
  </section>

  <BottomNav active="rewards" navigate={navigate} />
</main>
  );
}