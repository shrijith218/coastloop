import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../services/firebase";
import BottomNav from "../components/BottomNav";

function getMedal(rank) {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `#${rank}`;
}

export default function LeaderboardPage() {
  const navigate = useNavigate();

  const [leaders, setLeaders] = useState([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [community, setCommunity] = useState("CoastLoop Community");
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/login");
        return;
      }

      setCurrentUserId(currentUser.uid);

      try {
        const usersSnapshot = await getDocs(collection(db, "users"));

        const allUsers = usersSnapshot.docs.map((userDocument) => ({
          id: userDocument.id,
          ...userDocument.data(),
        }));

        const currentProfile = allUsers.find(
          (user) => user.id === currentUser.uid,
        );

        if (currentProfile?.communityId) {
          setCommunity(
            currentProfile.communityId
              .split("-")
              .map(
                (word) => word.charAt(0).toUpperCase() + word.slice(1),
              )
              .join(" "),
          );
        }

        const rankedUsers = allUsers
          .filter(
            (user) =>
              !currentProfile?.communityId ||
              user.communityId === currentProfile.communityId,
          )
          .sort(
            (firstUser, secondUser) =>
              (secondUser.rankScore || secondUser.ecoPoints || 0) -
              (firstUser.rankScore || firstUser.ecoPoints || 0),
          )
          .map((user, index) => ({
            ...user,
            rank: index + 1,
            score: user.rankScore || user.ecoPoints || 0,
          }));

        setLeaders(rankedUsers);
      } catch (error) {
        console.error("Unable to load leaderboard:", error);
        setMessage("Unable to load community rankings.");
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (isLoading) {
    return (
      <main className="app-page loading-page">
        <p>Loading community leaderboard...</p>
      </main>
    );
  }

  const currentUserRank = leaders.find(
    (leader) => leader.id === currentUserId,
  );

  return (
    <main className="app-page page-with-nav">
      <header className="page-title-header">
        <div>
          <p className="eyebrow">COMMUNITY IMPACT</p>
          <h1>Leaderboard</h1>
        </div>
        <span className="header-icon">🏆</span>
      </header>

      <section className="community-banner">
        <span>🌊</span>
        <div>
          <p>YOUR COMMUNITY</p>
          <h2>{community}</h2>
        </div>
      </section>

      {currentUserRank && (
        <section className="your-rank-card">
          <div>
            <p>Your current rank</p>
            <h2>{getMedal(currentUserRank.rank)}</h2>
          </div>
          <div>
            <p>{currentUserRank.name || "Coast Guardian"}</p>
            <strong>{currentUserRank.score} EcoPoints</strong>
          </div>
          <span>Keep disposing responsibly!</span>
        </section>
      )}

      {message && <p className="form-message">{message}</p>}

      <section className="leaderboard-list">
        {leaders.length ? (
          leaders.map((leader) => (
            <article
              className={`leaderboard-row ${
                leader.id === currentUserId ? "leaderboard-current-user" : ""
              }`}
              key={leader.id}
            >
              <span className="leader-rank">{getMedal(leader.rank)}</span>

              <div className="leader-avatar">
                {(leader.name || "C").charAt(0).toUpperCase()}
              </div>

              <div className="leader-details">
                <h2>
                  {leader.name || "Coast Guardian"}
                  {leader.id === currentUserId ? " (You)" : ""}
                </h2>
                <p>
                  {leader.totalVerifiedDisposals || 0} verified disposals
                </p>
              </div>

              <strong>{leader.score}</strong>
            </article>
          ))
        ) : (
          <section className="empty-state">
            <span>🌱</span>
            <h2>Be the first Coast Guardian</h2>
            <p>Verify a disposal to appear on your community leaderboard.</p>
          </section>
        )}
      </section>

      <BottomNav />
    </main>
  );
}