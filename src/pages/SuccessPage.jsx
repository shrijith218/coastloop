import { useLocation, useNavigate } from "react-router-dom";

export default function SuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const pointsAwarded = location.state?.pointsAwarded || 10;
  const binName = location.state?.binName || "CoastLoop bin";

  return (
    <main className="success-page centered-page">
      <section className="success-card">
        <div className="success-icon">🎉</div>
        <p className="success-label">DISPOSAL VERIFIED</p>
        <h1>Great work, Coast Guardian!</h1>
        <p>
          Your responsible disposal at <strong>{binName}</strong> was verified.
        </p>

        <div className="points-earned">
          +{pointsAwarded} EcoPoints
        </div>

        <p className="muted-text">
          You helped reduce the chance of plastic reaching Mumbai’s coast.
        </p>

        <button className="primary-button" onClick={() => navigate("/home")}>
          Back to Map
        </button>
      </section>
    </main>
  );
}