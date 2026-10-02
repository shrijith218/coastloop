import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { calculateDistance } from "../utils/calculateDistance";
import BottomNav from "../components/BottomNav";

const JUHU_DEMO_LOCATION = {
  latitude: 19.09845,
  longitude: 72.82645,
};

export default function HomePage() {
  const navigate = useNavigate();

  const [userProfile, setUserProfile] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyBins, setNearbyBins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [locationMessage, setLocationMessage] = useState(
    "Finding nearby CoastLoop bins...",
  );

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

        const binsSnapshot = await getDocs(collection(db, "bins"));

        const bins = binsSnapshot.docs
          .map((binDocument) => {
            const bin = binDocument.data();

            return {
              id: binDocument.id,
              ...bin,
              latitude: bin.location.latitude,
              longitude: bin.location.longitude,
            };
          })
          .filter((bin) => bin.isActive !== false);

        getUserLocationAndSortBins(bins);
      } catch (error) {
        console.error("Unable to load CoastLoop home data:", error);
        setLocationMessage("Unable to load bin information.");
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  function getUserLocationAndSortBins(bins) {
    if (!navigator.geolocation) {
      useDemoLocation(bins, "Location is not supported. Showing Juhu demo bins.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setUserLocation(currentLocation);
        sortBinsByDistance(bins, currentLocation);
        setLocationMessage("Showing bins within 500 m of your location.");
      },
      () => {
        useDemoLocation(
          bins,
          "Location permission was not granted. Showing Juhu demo bins.",
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      },
    );
  }

  function useDemoLocation(bins, message) {
    setUserLocation(JUHU_DEMO_LOCATION);
    sortBinsByDistance(bins, JUHU_DEMO_LOCATION);
    setLocationMessage(message);
  }

  function sortBinsByDistance(bins, currentLocation) {
    const filteredBins = bins
      .map((bin) => ({
        ...bin,
        distance: calculateDistance(
          currentLocation.latitude,
          currentLocation.longitude,
          bin.latitude,
          bin.longitude,
        ),
      }))
      .filter((bin) => bin.distance <= 500)
      .sort((firstBin, secondBin) => firstBin.distance - secondBin.distance);

    setNearbyBins(filteredBins);
    setIsLoading(false);
  }

  const nearestBin = nearbyBins[0];

  function openDirections(bin) {
    const destination = `${bin.latitude},${bin.longitude}`;
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=walking`,
      "_blank",
    );
  }

  function getStatusClass(status) {
    if (status === "available") return "status-green";
    if (status === "nearly_full") return "status-yellow";
    if (status === "full") return "status-red";
    return "status-grey";
  }

  function getStatusLabel(status) {
    if (status === "available") return "Available";
    if (status === "nearly_full") return "Nearly full";
    if (status === "full") return "Full";
    return "Status unknown";
  }

  if (isLoading) {
    return (
      <main className="home-page loading-page">
        <p>Loading your CoastLoop experience...</p>
      </main>
    );
  }

  return (
    <main className="home-page page-with-nav">
      <header className="home-header">
        <div>
          <p className="welcome-text">Welcome back,</p>
          <h1>{userProfile?.name || "Coast Guardian"} 🌊</h1>
        </div>

        <div className="points-badge">
          <span>EcoPoints</span>
          <strong>{userProfile?.ecoPoints || 0}</strong>
        </div>
      </header>

      <section className="location-card">
        <h2>📍 Nearby CoastLoop bins</h2>
        <p>{locationMessage}</p>
      </section>

      <section className="map-placeholder">
        <div className="map-water">
          <span className="user-marker">● You</span>

          {nearbyBins.map((bin, index) => (
            <span
              className={`bin-marker marker-${index % 3}`}
              key={bin.id}
            >
              {bin.status === "available" ? "🟢" : "🟡"} {bin.distance} m
            </span>
          ))}
        </div>
      </section>

      {nearestBin ? (
        <section className="nearest-bin-card">
          <div className="nearest-bin-heading">
            <p>NEAREST VERIFIED BIN</p>
            <span className={getStatusClass(nearestBin.status)}>
              {getStatusLabel(nearestBin.status)}
            </span>
          </div>

          <h2>{nearestBin.name}</h2>

          <p>
            {nearestBin.distance} m away · {nearestBin.fillLevel}% full
          </p>

          <div className="bin-action-buttons">
  <button
    className="primary-button"
    onClick={() => openDirections(nearestBin)}
  >
    Navigate to Nearest Bin
  </button>

  <button
    className="secondary-button scan-button"
    onClick={() => navigate(`/scan/${nearestBin.id}`)}
  >
    Scan Bin QR to Earn Points
  </button>
</div>
        </section>
      ) : (
        <section className="nearest-bin-card">
          <h2>No bins within 500 m</h2>
          <p>
            Try a different location or use the Juhu pilot-zone demo location.
          </p>
        </section>
      )}

      <section className="bin-list">
  <h2>Bins around you</h2>

  {nearbyBins.map((bin) => (
    <article className="bin-list-item" key={bin.id}>
      <div>
        <h3>{bin.name}</h3>
        <p>
          {bin.distance} m away · {bin.fillLevel}% full
        </p>
      </div>

      <div className="bin-list-actions">
        <button
          className="secondary-button"
          onClick={() => openDirections(bin)}
        >
          Navigate
        </button>

        <button
          className="secondary-button scan-button"
          onClick={() => navigate(`/scan/${bin.id}`)}
        >
          Scan QR
        </button>
      </div>
    </article>
  ))}
</section>
<BottomNav />
    </main>
  );
}