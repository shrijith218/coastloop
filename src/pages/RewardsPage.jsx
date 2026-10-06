import BottomNav from "../components/BottomNav";

export default function RewardsPage() {
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
          <strong>0</strong>
          <small>EcoPoints</small>
        </div>

        <div className="impact-level">
          <span>Level</span>
          <strong>Silver</strong>
          <span className="level-icon">★</span>
        </div>
      </section>

      <h2 className="content-section-title">This Month</h2>

      <section className="impact-stat-grid">
        <article>
          <span>♻</span>
          <strong>0</strong>
          <small>Cleanups</small>
        </article>

        <article>
          <span>◌</span>
          <strong>0 kg</strong>
          <small>Plastic Prevented</small>
        </article>

        <article>
          <span>⌖</span>
          <strong>0</strong>
          <small>Sites Visited</small>
        </article>
      </section>

      <BottomNav active="rewards" />
    </main>
  );
}