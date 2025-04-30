// src/components/vehicles/VehicleMap.tsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { LatLngExpression } from "leaflet";
import L from "leaflet"; // Import L for icon configuration
import "leaflet/dist/leaflet.css"; // Import Leaflet CSS
import { WS_ENDPOINT } from "../services/apiService"; // Assuming apiService exports this
import { AuthUtils } from "@/lib/authUtils";
import { Socket, Channel } from "phoenix";
import car_image from "/car-icon.png"; // Import your car icon image
// --- Configure Leaflet Icons ---
// Fixes potential issues with marker icons not showing up
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  // iconRetinaUrl: car_image?.default,
  iconUrl: car_image,
  shadowUrl: null,
});
// --- End Icon Configuration ---

// --- Type Definitions ---
interface Telemetry {
  lat: number | null;
  long: number | null;
  inserted_at?: string; // Optional fields from your original code
  rpm?: number;
  ip?: string;
  speed?: number;
  fuel?: number;
  status?: string;
  coolant_temp?: number;
  engine_load?: number;
}

interface Vehicle {
  id: number;
  code: string;
  vin: string;
  manufacturer: string;
  model: string;
  make_year: number;
  status: string;
  type: string;
  plate?: string; // Optional fields from your original code
  color?: string;
  iot_device?: {
    id: number;
    model: string;
  };
  latest_telemetry: Telemetry | null; // Telemetry can be null initially
}
// --- End Type Definitions ---

// Main VehicleMap Component
export const VehiclesMapPage = () => {
  const ws_url = WS_ENDPOINT;
  const CHANNEL_TOPIC = "vehicles:live";
  const token = AuthUtils.getToken();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const channelRef = useRef<Channel | null>(null);

  // --- WebSocket Effect ---
  useEffect(() => {
    // Ensure cleanup runs only once if component remounts quickly (Strict Mode)
    if (socketRef.current) {
      console.log("WebSocket connection already exists. Skipping setup.");
      return;
    }

    const socket = new Socket(ws_url, { params: { token } });
    socketRef.current = socket; // Store socket instance
    socket.connect();
    console.log("Attempting to connect WebSocket...");

    const channel = socket.channel(CHANNEL_TOPIC, {});
    channelRef.current = channel; // Store channel instance

    channel
      .join()
      .receive("ok", (resp) => {
        console.info("✅ Joined channel:", CHANNEL_TOPIC, resp);
        setError(null); // Clear error on successful join
      })
      .receive("error", (resp) => {
        console.error("❌ Failed to join channel:", resp);
        setError(`Failed to join live channel: ${resp?.reason || "Unknown error"}`);
      })
      .receive("timeout", () => {
        console.warn("⏰ Channel join timed out");
        setError("Channel join timed out.");
      });

    // --- Event Handlers ---

    channel.on("initial_vehicles", (payload: { data: Vehicle[] }) => {
      console.log("📥 Initial vehicles:", payload.data.length);
      // Ensure lat/long are numbers or null
      const sanitizedData = payload.data.map((v) => ({
        ...v,
        latest_telemetry: v.latest_telemetry
          ? {
              ...v.latest_telemetry,
              lat: v.latest_telemetry.lat ? Number(v.latest_telemetry.lat) : null,
              long: v.latest_telemetry.long ? Number(v.latest_telemetry.long) : null,
            }
          : null,
      }));
      setVehicles(sanitizedData);
    });

    channel.on("vehicle_created", (payload: { data: Vehicle }) => {
      console.log("📥 vehicle_created:", payload.data.id);
      const newVehicle = {
        ...payload.data,
        latest_telemetry: payload.data.latest_telemetry
          ? {
              ...payload.data.latest_telemetry,
              lat: payload.data.latest_telemetry.lat ? Number(payload.data.latest_telemetry.lat) : null,
              long: payload.data.latest_telemetry.long ? Number(payload.data.latest_telemetry.long) : null,
            }
          : null,
      };
      setVehicles((prev) => [newVehicle, ...prev]);
      // Optional: Add highlighting logic here if needed later
    });

    channel.on("vehicle_deleted", (payload: { id: number }) => {
      console.log("📥 vehicle_deleted:", payload.id);
      setVehicles((prev) => prev.filter((v) => v.id !== payload.id));
    });

    channel.on("vehicle_updated", (payload: { data: Vehicle }) => {
      console.log("📥 vehicle_updated:", payload.data.id, payload.data.latest_telemetry);
      const updatedVehicleData = {
        ...payload.data,
        latest_telemetry: payload.data.latest_telemetry
          ? {
              ...payload.data.latest_telemetry,
              lat: payload.data.latest_telemetry.lat ? Number(payload.data.latest_telemetry.lat) : null,
              long: payload.data.latest_telemetry.long ? Number(payload.data.latest_telemetry.long) : null,
            }
          : null, // Handle case where update might remove telemetry
      };
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === updatedVehicleData.id
            ? { ...v, ...updatedVehicleData } // Merge updates, preserving existing fields if not in payload
            : v,
        ),
      );
      // Optional: Add highlighting logic here if needed later
    });

    channel.onError((err) => {
      console.error("Channel error:", err);
      setError("Channel encountered an error. Check console.");
    });

    socket.onError((err) => {
      console.error("Socket error:", err);
      setError("WebSocket connection error. Check console.");
    });

    socket.onOpen(() => {
      console.log("WebSocket opened");
      setError(null); // Clear error on successful open
    });

    socket.onClose((event) => {
      console.warn("WebSocket closed:", event);
      // Optional: Implement reconnection logic here if needed
      // setError("WebSocket connection closed.");
    });

    // --- Cleanup ---
    return () => {
      console.log("Cleaning up WebSocket connection...");
      channelRef.current?.leave()
        .receive("ok", () => console.log("Left channel successfully"))
        .receive("error", (err) => console.error("Error leaving channel:", err));
      socketRef.current?.disconnect(() => console.log("Socket disconnected"));
      channelRef.current = null;
      socketRef.current = null;
    };
  }, [token, ws_url]); // Dependencies for setting up the connection

  // Default map center (e.g., London)
  const defaultCenter: LatLngExpression = [51.505, -0.09];

  return (
    <div className="rounded-md border overflow-hidden relative h-screen w-full">
      {error && (
        <div className="absolute top-2 left-2 z-[1000] bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
          Error: {error}
        </div>
      )}
      <MapContainer
        center={defaultCenter}
        zoom={5} // Start zoomed out a bit more
        scrollWheelZoom={true} // Enable scroll wheel zoom
        className="w-full h-full" // Ensure map fills the container
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {vehicles.map((vehicle) => {
          // Check if telemetry and valid coordinates exist
          const lat = vehicle.latest_telemetry?.lat;
          const long = vehicle.latest_telemetry?.long;

          if (
            typeof lat === "number" &&
            !isNaN(lat) &&
            typeof long === "number" &&
            !isNaN(long)
          ) {
            const position: LatLngExpression = [lat, long];
            return (
              <Marker key={vehicle.id} position={position}>
                <Popup>
                  <b>Vehicle Code:</b> {vehicle.code} <br />
                  <b>ID:</b> {vehicle.id} <br />
                  <b>Status:</b> {vehicle.status} <br />
                  <b>Type:</b> {vehicle.type} <br />
                  {vehicle.plate && (
                    <>
                      <b>Plate:</b> {vehicle.plate} <br />
                    </>
                  )}
                  {vehicle.latest_telemetry?.speed !== undefined && (
                    <>
                      <b>Speed:</b> {vehicle.latest_telemetry.speed} km/h <br />
                    </>
                  )}
                  {vehicle.latest_telemetry?.inserted_at && (
                    <>
                      <b>Last Update:</b>{" "}
                      {new Date(
                        vehicle.latest_telemetry.inserted_at,
                      ).toLocaleString()}{" "}
                      <br />
                    </>
                  )}
                </Popup>
              </Marker>
            );
          }
          // If no valid coordinates, don't render a marker for this vehicle
          return null;
        })}
      </MapContainer>
    </div>
  );
};
