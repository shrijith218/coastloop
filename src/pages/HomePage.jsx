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
   <main className="app-shell">
  <header className="app-header">
    <div className="header-brand">
      <div className="small-brand-mark">◎</div>
      <span>CoastLoop</span>
    </div>

    <button className="header-icon-button" aria-label="Notifications">
      ◌
    </button>
  </header>

  <section className="map-page-content">
    <div className="map-toolbar">
      <div className="search-box">
        <span>⌕</span>
        <input placeholder="Search collection points" />
      </div>

      <button className="filter-button">≡</button>
    </div>

    <section className="map-placeholder professional-map">
      <div className="map-water">
        <div className="map-road road-one" />
        <div className="map-road road-two" />
        <span className="user-location-marker">●</span>

        {nearbyBins.map((bin, index) => (
          <button
            className={`map-bin-marker marker-${index % 3}`}
            key={bin.id}
            onClick={() => navigate(`/scan/${bin.id}`)}
          >
            <span>♻</span>
          </button>
        ))}
      </div>

      <button className="current-location-button">⌖</button>
    </section>

    {nearestBin && (
      <section className="collection-point-card">
        <div className="collection-point-topline">
          <div>
            <p className="eyebrow">NEAREST COLLECTION POINT</p>
            <h2>{nearestBin.name}</h2>
          </div>

          <span className={getStatusClass(nearestBin.status)}>
            {getStatusLabel(nearestBin.status)}
          </span>
        </div>

        <p className="collection-distance">
          {nearestBin.distance} m away · {nearestBin.fillLevel}% full
        </p>

        <button
          className="wide-action-button"
          onClick={() => openDirections(nearestBin)}
        >
          Get Directions
        </button>
      </section>
    )}
  </section>

  <BottomNav active="map" navigate={navigate} />
</main>
  );
}