import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../services/firebase";
import BottomNav from "../components/BottomNav";

function formatCommunity(communityId) {
  if (!communityId) return "CoastLoop Community";

  return communityId
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function ProfilePage() {
  const navigate = useNavigate();

  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/login");
        return;
      }

      try {
        const userDocument = await getDoc(doc(db, "users", currentUser.uid));

        if (userDocument.exists()) {
          setUserProfile({
            uid: currentUser.uid,
            ...userDocument.data(),
          });
        } else {
          setError("Your CoastLoop profile could not be found.");
        }
      } catch (loadError) {
        console.error("Unable to load profile:", loadError);
        setError("Unable to load your CoastLoop profile.");
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  async function handleLogout() {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (logoutError) {
      console.error("Unable to log out:", logoutError);
      setError("Unable to log out. Please try again.");
    }
  }

  if (isLoading) {
    return (
      <main className="app-page loading-page">
        <p>Loading your profile...</p>
      </main>
    );
  }

  const displayName = userProfile?.name || "Coast Guardian";
  const points = userProfile?.ecoPoints || 0;
  const disposalCount = userProfile?.totalVerifiedDisposals || 0;
  const reportCount = userProfile?.totalReports || 0;
  const badges = userProfile?.badges || ["CoastLoop Starter"];

  return (
    <main className="app-page page-with-nav">
      <header className="page-title-header">
        <div>
          <p className="eyebrow">COAST GUARDIAN PROFILE</p>
          <h1>My Profile</h1>
        </div>
        <span className="header-icon">👤</span>
      </header>

      <section className="profile-hero">
        <div className="profile-avatar">
          {displayName.charAt(0).toUpperCase()}
        </div>

        <div>
          <h2>{displayName}</h2>
          <p>{userProfile?.email}</p>
          <span>{formatCommunity(userProfile?.communityId)}</span>
        </div>
      </section>

      <section className="profile-points-card">
        <p>EcoPoints earned</p>
        <h2>{points}</h2>
        <span>Every verified action helps protect the coast.</span>
      </section>

      <section className="profile-stats">
        <article>
          <span>♻️</span>
          <strong>{disposalCount}</strong>
          <p>Verified disposals</p>
        </article>

        <article>
          <span>📍</span>
          <strong>{reportCount}</strong>
          <p>Waste reports</p>
        </article>

        <article>
          <span>🌊</span>
          <strong>{Math.round(disposalCount * 0.08 * 10) / 10} kg</strong>
          <p>Estimated plastic diverted</p>
        </article>
      </section>

      <section className="badges-section">
        <div className="section-heading">
          <h2>My badges</h2>
          <span>{badges.length} earned</span>
        </div>

        <div className="badges-grid">
          {badges.map((badge) => (
            <article className="badge-card" key={badge}>
              <span>🏅</span>
              <p>{badge}</p>
            </article>
          ))}

          <article className="badge-card badge-locked">
            <span>🔒</span>
            <p>Cleanup Champion</p>
          </article>
        </div>
      </section>

      {error && <p className="form-error">{error}</p>}

      <button className="logout-button" onClick={handleLogout}>
        Log Out
      </button>

      <BottomNav />
    </main>
  );
}