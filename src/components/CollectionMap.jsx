import { useEffect } from "react";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

const DEMO_CENTER = [19.09845, 72.82645];

function RecenterMap({ center }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, 15, {
      animate: true,
    });
  }, [center, map]);

  return null;
}

export default function CollectionMap({
  userLocation,
  bins,
  onBinClick,
}) {
  const center = userLocation
    ? [userLocation.latitude, userLocation.longitude]
    : DEMO_CENTER;

  return (
    <section className="leaflet-map-wrapper">
      <MapContainer
        center={center}
        zoom={15}
        scrollWheelZoom
        className="coastloop-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RecenterMap center={center} />

        <CircleMarker
          center={center}
          radius={10}
          pathOptions={{
            color: "#ffffff",
            fillColor: "#1a73e8",
            fillOpacity: 1,
            weight: 4,
          }}
        >
          <Popup>
            <strong>Your location</strong>
          </Popup>
        </CircleMarker>

        {bins.map((bin) => {
          const isAvailable = bin.status === "available";

          return (
            <CircleMarker
              key={bin.id}
              center={[bin.latitude, bin.longitude]}
              radius={12}
              pathOptions={{
                color: "#ffffff",
                fillColor: isAvailable ? "#087f9b" : "#efaa3c",
                fillOpacity: 1,
                weight: 3,
              }}
            >
              <Popup>
                <div className="bin-map-popup">
                  <strong>{bin.name}</strong>

                  <p>
                    {bin.distance} m away · {bin.fillLevel}% full
                  </p>

                  <button
                    type="button"
                    className="map-popup-button"
                    onClick={() => onBinClick(bin)}
                  >
                    Scan this bin
                  </button>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </section>
  );
}