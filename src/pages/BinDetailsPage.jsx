import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import BottomNav from "../components/BottomNav";

export default function BinDetailsPage() {
  const { binId } = useParams();
  const navigate = useNavigate();

  const [bin, setBin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBin() {
      try {
        setIsLoading(true);
        setError("");

        const binReference = doc(db, "bins", binId);
        const binSnapshot = await getDoc(binReference);

        if (!binSnapshot.exists()) {
          setError("This collection point could not be found.");
          return;
        }

        const binData = binSnapshot.data();

        setBin({
          id: binSnapshot.id,
          ...binData,
          latitude: binData.location?.latitude,
          longitude: binData.location?.longitude,
        });
      } catch (loadError) {
        console.error("Unable to load bin details:", loadError);
        setError("Unable to load this collection point. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    loadBin();
  }, [binId]);

  function getStatusLabel(status) {
    if (status === "available") return "Available";
    if (status === "nearly_full") return "Nearly full";
    if (status === "full") return "Full";
    if (status === "maintenance") return "Under maintenance";

    return "Status unknown";
  }

  function getStatusClass(status) {
    if (status === "available") return "status-green";
    if (status === "nearly_full") return "status-yellow";
    if (status === "full") return "status-red";

    return "status-grey";
  }

  function getFillLabel(fillLevel) {
    if (fillLevel >= 90) return "Collection needed soon";
    if (fillLevel >= 70) return "Approaching capacity";
    return "Ready for disposal";
  }

  function openDirections() {
    if (
      typeof bin?.latitude !== "number" ||
      typeof bin?.longitude !== "number"
    ) {
      alert("Location coordinates are not available for this collection point.");
      return;
    }

    const destination = `${bin.latitude},${bin.longitude}`;

    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=walking`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  if (isLoading) {
    return (
      <main className="bin-details-page app-shell centered-page">
        <p className="page-loading-text">Loading collection point...</p>
      </main>
    );
  }

  if (error || !bin) {
    return (
      <main className="bin-details-page app-shell">
        <header className="details-header">
          <button
            type="button"
            className="back-icon-button"
            onClick={() => navigate("/home")}
            aria-label="Back to map"
          >
            ←
          </button>

          <h1>Collection Point</h1>
        </header>

        <section className="details-error-card">
          <span>!</span>
          <h2>Unable to open bin</h2>
          <p>{error || "The requested collection point is unavailable."}</p>

          <button
            type="button"
            className="primary-button"
            onClick={() => navigate("/home")}
          >
            Back to Map
          </button>
        </section>

        <BottomNav active="map" />
      </main>
    );
  }

  const fillLevel = Number(bin.fillLevel || 0);

  return (
    <main className="bin-details-page app-shell">
      <header className="details-header">
        <button
          type="button"
          className="back-icon-button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          ←
        </button>

        <div>
          <p className="page-kicker">COASTLOOP COLLECTION POINT</p>
          <h1>Bin Details</h1>
        </div>

        <button
          type="button"
          className="details-map-button"
          onClick={() => navigate("/home")}
          aria-label="Open map"
        >
          ⌖
        </button>
      </header>

      <section className="bin-details-hero">
        <div className="bin-hero-icon">♻</div>

        <div className="bin-hero-content">
          <div className="bin-title-row">
            <div>
              <p className="eyebrow">SMART COLLECTION BIN</p>
              <h2>{bin.name || "CoastLoop Collection Point"}</h2>
            </div>

            <span className={getStatusClass(bin.status)}>
              {getStatusLabel(bin.status)}
            </span>
          </div>

          <p className="bin-address">
            {bin.address || bin.area || "Verified CoastLoop collection point"}
          </p>
        </div>
      </section>

      <section className="bin-status-card">
        <div className="section-row">
          <div>
            <p className="eyebrow">BIN CAPACITY</p>
            <h2>{fillLevel}% full</h2>
          </div>

          <span className="capacity-message">
            {getFillLabel(fillLevel)}
          </span>
        </div>

        <div
          className="fill-progress-track"
          aria-label={`Bin is ${fillLevel}% full`}
        >
          <div
            className={`fill-progress-bar ${
              fillLevel >= 90
                ? "fill-danger"
                : fillLevel >= 70
                  ? "fill-warning"
                  : "fill-safe"
            }`}
            style={{ width: `${Math.min(Math.max(fillLevel, 0), 100)}%` }}
          />
        </div>

        <div className="capacity-scale">
          <span>Empty</span>
          <span>Full</span>
        </div>
      </section>

      <section className="bin-info-grid">
        <article className="bin-info-tile">
          <span className="info-tile-icon">◉</span>
          <div>
            <small>Availability</small>
            <strong>{getStatusLabel(bin.status)}</strong>
          </div>
        </article>

        <article className="bin-info-tile">
          <span className="info-tile-icon">⌖</span>
          <div>
            <small>Bin ID</small>
            <strong>{bin.id}</strong>
          </div>
        </article>

        <article className="bin-info-tile">
          <span className="info-tile-icon">♻</span>
          <div>
            <small>Accepted waste</small>
            <strong>{bin.wasteType || "Dry recyclable waste"}</strong>
          </div>
        </article>

        <article className="bin-info-tile">
          <span className="info-tile-icon">✓</span>
          <div>
            <small>Verification</small>
            <strong>QR + sensor enabled</strong>
          </div>
        </article>
      </section>

      <section className="bin-location-card">
        <p className="eyebrow">LOCATION</p>
        <h2>{bin.address || bin.area || "CoastLoop pilot zone"}</h2>

        {typeof bin.latitude === "number" &&
          typeof bin.longitude === "number" && (
            <p>
              {bin.latitude.toFixed(5)}, {bin.longitude.toFixed(5)}
            </p>
          )}
      </section>

      <section className="bin-details-actions">
        <button
          type="button"
          className="details-secondary-button"
          onClick={openDirections}
        >
          <span>⌖</span>
          Get Directions
        </button>

        <button
          type="button"
          className="details-primary-button"
          onClick={() => navigate(`/scan/${bin.id}`)}
        >
          <span>⌾</span>
          Scan Bin QR
        </button>
      </section>

      <p className="bin-safety-note">
        Earn EcoPoints only after QR validation and successful disposal
        verification.
      </p>

      <BottomNav active="map" scanBinId={bin.id} />
    </main>
  );
}