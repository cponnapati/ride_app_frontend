import React, { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getPseudoRoute } from "../utils/pricing";

// Fix Leaflet default icon paths in Vite/React
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default function RouteMap({ city, from, to }) {
  const route = useMemo(() => getPseudoRoute({ city, from, to }), [city, from, to]);

  const center = [route.center.lat, route.center.lng];
  const pickup = [route.pickup.lat, route.pickup.lng];
  const drop = [route.drop.lat, route.drop.lng];

  return (
    <div className="h-full w-full">
      <MapContainer
        center={center}
        zoom={route.center.zoom || 12}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          // Standard OSM tiles (no key)
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <Marker position={pickup} />
        <Marker position={drop} />
        <Polyline positions={[pickup, drop]} />
      </MapContainer>
    </div>
  );
}

