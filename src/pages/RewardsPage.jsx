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
    <main className="app-page page-with-nav">
      <header className="page-title-header">
        <div>
          <p className="eyebrow">YOUR ECO WALLET</p>
          <h1>Rewards</h1>
        </div>

        <div className="points-badge">
          <span>EcoPoints</span>
          <strong>{points}</strong>
        </div>
      </header>

      <section className="reward-wallet-card">
        <div className="wallet-wave">🌊</div>
        <div>
          <p>Your current balance</p>
          <h2>{points} EcoPoints</h2>

          {nextReward ? (
            <span>
              {nextReward.points - points} points until{" "}
              <strong>{nextReward.title}</strong>
            </span>
          ) : (
            <span>You can unlock every current CoastLoop reward.</span>
          )}
        </div>
      </section>

      {message && <p className="form-message">{message}</p>}

      <section className="rewards-grid">
        {mockRewards.map((reward) => {
          const canRedeem = points >= reward.points;
          const progress = Math.min((points / reward.points) * 100, 100);

          return (
            <article className="reward-card" key={reward.id}>
              <div className="reward-card-top">
                <span className="reward-icon">{reward.icon}</span>
                <span
                  className={`reward-state ${
                    canRedeem ? "reward-state-ready" : ""
                  }`}
                >
                  {canRedeem ? "Available" : `${reward.points} pts`}
                </span>
              </div>

              <h2>{reward.title}</h2>
              <p>{reward.description}</p>

              <div className="reward-progress-track">
                <span style={{ width: `${progress}%` }} />
              </div>

              <div className="reward-card-footer">
                <strong>{reward.points} EcoPoints</strong>
                <button
                  className={canRedeem ? "primary-button compact-button" : "secondary-button"}
                  onClick={() => handleRedeem(reward)}
                >
                  {canRedeem ? "Redeem" : "View Goal"}
                </button>
              </div>
            </article>
          );
        })}
      </section>

      <section className="reward-note">
        <h2>How do rewards work?</h2>
        <p>
          Earn EcoPoints through verified bin disposal, cleanup participation,
          and validated community reports. Demo rewards are shown for the
          hackathon; secure coupons will be issued through the partner system
          in deployment.
        </p>
      </section>

      <BottomNav />
    </main>
  );
}