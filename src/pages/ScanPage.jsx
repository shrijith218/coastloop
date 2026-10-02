import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";

export default function ScanPage() {
  const { binId } = useParams();
  const navigate = useNavigate();

  const scannerRef = useRef(null);
  const hasScannedRef = useRef(false);

  const [bin, setBin] = useState(null);
  const [error, setError] = useState("");
  const [scannerMessage, setScannerMessage] = useState(
    "Preparing camera scanner...",
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function stopAndClearScanner(scanner) {
      if (!scanner) return;

      try {
        const scannerState = scanner.getState();

        if (
          scannerState === Html5QrcodeScannerState.SCANNING ||
          scannerState === Html5QrcodeScannerState.PAUSED
        ) {
          await scanner.stop();
        }
      } catch (stopError) {
        console.warn("Scanner stop skipped:", stopError.message);
      }

      try {
        await scanner.clear();
      } catch (clearError) {
        console.warn("Scanner clear skipped:", clearError.message);
      }
    }

    async function loadBinAndStartScanner() {
      if (!auth.currentUser) {
        navigate("/login");
        return;
      }

      try {
        const binDocument = await getDoc(doc(db, "bins", binId));

        if (!binDocument.exists()) {
          throw new Error("This CoastLoop bin was not found.");
        }

        if (!isMounted) return;

        setBin({
          id: binDocument.id,
          ...binDocument.data(),
        });

        const scanner = new Html5Qrcode("coastloop-qr-reader");
        scannerRef.current = scanner;

        setScannerMessage(
          "Allow camera access, then point the camera at the CoastLoop bin QR code.",
        );

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 240, height: 240 },
            aspectRatio: 1,
          },
          async (decodedText) => {
            if (hasScannedRef.current) return;

            hasScannedRef.current = true;
            setScannerMessage("QR detected. Validating bin identity...");

            await stopAndClearScanner(scanner);

            const expectedQrValue = `COASTLOOP:${binId}`;

            if (decodedText.trim() !== expectedQrValue) {
              hasScannedRef.current = false;
              setError(
                `This QR belongs to another bin. Please scan the QR for ${binId}.`,
              );
              setScannerMessage(
                "Incorrect QR detected. Return to Home and reopen the scanner.",
              );
              return;
            }

            navigate(`/verify/${binId}`);
          },
          () => {
            // Ignore ongoing scan-frame failures while no QR code is visible.
          },
        );
      } catch (scanError) {
        console.error("QR scanner error:", scanError);

        if (isMounted) {
          setError(
            "Camera could not start. Allow camera permission and try again.",
          );
          setScannerMessage("Camera scanner unavailable.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadBinAndStartScanner();

    return () => {
      isMounted = false;
      stopAndClearScanner(scannerRef.current);
    };
  }, [binId, navigate]);

  function useDemoQr() {
    navigate(`/verify/${binId}`);
  }

  return (
    <main className="scan-page">
      <header className="page-header">
        <button className="back-button" onClick={() => navigate("/home")}>
          ← Back
        </button>
        <h1>Scan Bin QR</h1>
      </header>

      <section className="scan-card">
        <h2>{bin?.name || "Loading CoastLoop bin..."}</h2>

        <p className="muted-text">
          Deposit waste into the selected bin, then scan its CoastLoop QR label
          to start disposal verification.
        </p>

        <div className="camera-reader-wrap">
          <div id="coastloop-qr-reader" />
        </div>

        <p className="scanner-message">{scannerMessage}</p>

        {isLoading && (
          <p className="muted-text">Starting camera...</p>
        )}

        {error && <p className="form-error">{error}</p>}

        <section className="demo-fallback">
          <p>
            <strong>Demo fallback:</strong> Use only if camera access is not
            available during your hackathon presentation.
          </p>

          <button className="secondary-button" onClick={useDemoQr}>
            Continue in Demo QR Mode
          </button>
        </section>

        <p className="safety-note">
          The QR must match the selected bin. Reward validation also requires
          GPS proximity, a 10-second delay, and IR-sensor confirmation.
        </p>
      </section>
    </main>
  );
}