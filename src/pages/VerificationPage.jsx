import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  collection,
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { calculateDistance } from "../utils/calculateDistance";

const MAX_DISTANCE_METRES = 40;
const REWARD_POINTS = 10;
const MINIMUM_WAIT_SECONDS = 10;

export default function VerificationPage() {
  const { binId } = useParams();
  const navigate = useNavigate();

  const [bin, setBin] = useState(null);
  const [secondsRemaining, setSecondsRemaining] = useState(
    MINIMUM_WAIT_SECONDS,
  );
  const [gpsStatus, setGpsStatus] = useState("Checking your location...");
  const [locationVerified, setLocationVerified] = useState(false);
  const [canConfirm, setCanConfirm] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBinAndVerifyLocation() {
      if (!auth.currentUser) {
        navigate("/login");
        return;
      }

      try {
        const binDocument = await getDoc(doc(db, "bins", binId));

        if (!binDocument.exists()) {
          setError("This CoastLoop bin was not found.");
          return;
        }

        const binData = {
          id: binDocument.id,
          ...binDocument.data(),
        };

        setBin(binData);
        verifyUserLocation(binData);
      } catch (loadError) {
        console.error(loadError);
        setError("Unable to load disposal verification.");
      }
    }

    loadBinAndVerifyLocation();
  }, [binId, navigate]);

  useEffect(() => {
    if (!locationVerified) return;

    if (secondsRemaining <= 0) {
      setCanConfirm(true);
      return;
    }

    const timer = setTimeout(() => {
      setSecondsRemaining((currentSeconds) => currentSeconds - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [locationVerified, secondsRemaining]);

  function verifyUserLocation(binData) {
    if (!navigator.geolocation) {
      setGpsStatus("GPS is unavailable on this device.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const distance = calculateDistance(
          position.coords.latitude,
          position.coords.longitude,
          binData.location.latitude,
          binData.location.longitude,
        );

        if (distance <= MAX_DISTANCE_METRES) {
          setLocationVerified(true);
          setGpsStatus(`Location verified: you are ${distance} m from the bin.`);
        } else {
          setGpsStatus(
            `You are ${distance} m away. Move within ${MAX_DISTANCE_METRES} m of the bin.`,
          );
        }
      },
      () => {
        setGpsStatus("Location permission is required to validate rewards.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  }

  async function confirmDemoSensorEvent() {
    if (!auth.currentUser || !locationVerified || !canConfirm) {
      return;
    }

    try {
      setIsConfirming(true);
      setError("");

      const userReference = doc(db, "users", auth.currentUser.uid);
      const disposalReference = doc(collection(db, "disposalEvents"));

      await runTransaction(db, async (transaction) => {
        const userSnapshot = await transaction.get(userReference);

        if (!userSnapshot.exists()) {
          throw new Error("User profile was not found.");
        }

        const currentPoints = userSnapshot.data().ecoPoints || 0;
        const currentDisposals =
          userSnapshot.data().totalVerifiedDisposals || 0;

        transaction.update(userReference, {
          ecoPoints: currentPoints + REWARD_POINTS,
          rankScore: currentPoints + REWARD_POINTS,
          totalVerifiedDisposals: currentDisposals + 1,
        });

        transaction.set(disposalReference, {
          userId: auth.currentUser.uid,
          binId: binId,
          binName: bin.name,
          pointsAwarded: REWARD_POINTS,
          verificationStatus: "demo_approved",
          verifiedBy: ["qr", "gps", "10_second_wait", "demo_sensor"],
          createdAt: serverTimestamp(),
        });
      });

      navigate("/success", {
        state: {
          pointsAwarded: REWARD_POINTS,
          binName: bin.name,
        },
      });
    } catch (verificationError) {
      console.error(verificationError);
      setError("Unable to award points. Please try again.");
    } finally {
      setIsConfirming(false);
    }
  }

  return (
    <main className="verification-page">
      <header className="page-header">
        <button className="back-button" onClick={() => navigate("/home")}>
          ← Cancel
        </button>
        <h1>Verify Disposal</h1>
      </header>

      <section className="verification-card">
        <div className="verification-icon">♻️</div>

        <h2>{bin?.name || "Loading bin..."}</h2>

        <div className="verification-status">
          <p>QR identity: <strong>Verified ✅</strong></p>
          <p>GPS: {gpsStatus}</p>
          <p>
            Wait timer:{" "}
            <strong>
              {secondsRemaining > 0
                ? `${secondsRemaining} seconds remaining`
                : "Complete ✅"}
            </strong>
          </p>
        </div>

        {locationVerified && secondsRemaining > 0 && (
          <div className="countdown-ring">
            {secondsRemaining}
          </div>
        )}

        {canConfirm ? (
          <section className="sensor-demo-card">
            <h3>Deposit waste into the bin</h3>
            <p>
              Demo mode: press this after placing waste. In the final system,
              the ESP32 IR sensor will trigger this confirmation automatically.
            </p>

            <button
              className="primary-button"
              onClick={confirmDemoSensorEvent}
              disabled={isConfirming}
            >
              {isConfirming
                ? "Verifying disposal..."
                : "Simulate IR Sensor: Waste Detected"}
            </button>
          </section>
        ) : (
          <p className="muted-text">
            Keep this screen open and remain close to the bin until all checks
            are complete.
          </p>
        )}

        {error && <p className="form-error">{error}</p>}
      </section>
    </main>
  );
}