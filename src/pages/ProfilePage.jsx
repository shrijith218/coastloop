import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import { auth } from "../services/firebase";

export default function ProfilePage() {
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut(auth);
    navigate("/login");
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
        <div className="profile-avatar">CG</div>

        <div>
          <h2>Coast Guardian</h2>
          <p>Protecting the coast, one action at a time.</p>
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