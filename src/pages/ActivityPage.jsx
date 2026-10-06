import BottomNav from "../components/BottomNav";

export default function ActivityPage() {
  return (
    <main className="activity-page app-shell">
      <header className="simple-page-header">
        <div>
          <p className="page-kicker">COASTLOOP</p>
          <h1>Your Activity</h1>
        </div>
      </header>

      <section className="empty-state-card">
        <span className="empty-state-icon">◷</span>
        <h2>No activity yet</h2>
        <p>
          Your verified disposal and cleanup activity will appear here.
        </p>
      </section>

      <BottomNav active="activity" />
    </main>
  );
}
