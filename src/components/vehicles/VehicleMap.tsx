// src/components/vehicles/VehicleMap.tsx
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { LatLngExpression, LatLngBounds, Map } from 'leaflet';
import { Vehicle } from '@/types/vehicle';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import L from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
    iconUrl,
    iconRetinaUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
// --- End Optional Icon ---

// --- Included formatDateTime function ---
const formatDateTime = (timestamp: string | null | undefined): string => {
    if (!timestamp) return "N/A";
    try {
        // Basic check for ISO-like format before parsing
        if (typeof timestamp === 'string' && timestamp.match(/^\d{4}-\d{2}-\d{2}/)) {
            return new Date(timestamp).toLocaleString();
        }
        // If not a recognizable format, return as is or indicate issue
        return "Invalid Date Format";
    } catch (e) {
        console.error("Error formatting date:", timestamp, e);
        return "Invalid Date";
    }
};
// --- End formatDateTime function ---


interface VehicleMapProps {
  vehicles: Vehicle[];
}

// Helper to check if a string can be parsed into a valid latitude/longitude number
const isValidCoordinateString = (coordStr: string | null | undefined): coordStr is string => {
    if (typeof coordStr !== 'string' || coordStr.trim() === '') return false;
    const num = parseFloat(coordStr);
    return !isNaN(num) && isFinite(num);
};

// Helper type for vehicles confirmed to have valid, parsable coordinates
type VehicleWithValidCoords = Vehicle & {
    latest_telemetry: { lat: string; long: string; timestamp: string | null }
};

// Map Controller Component (handles map instance interactions)
interface MapControllerProps {
    vehicles: VehicleWithValidCoords[];
    currentIndex: number | null;
    initialBounds: LatLngBounds | null;
}

const MapController: React.FC<MapControllerProps> = ({ vehicles, currentIndex, initialBounds }) => {
    const map = useMap();
    const isInitialLoad = useRef(true);

    useLayoutEffect(() => {
        if (isInitialLoad.current && initialBounds && initialBounds.isValid()) {
            map.fitBounds(initialBounds, { padding: [50, 50], maxZoom: 16 });
            isInitialLoad.current = false;
        }
    }, [map, initialBounds]);

    useLayoutEffect(() => {
        if (!isInitialLoad.current && currentIndex !== null && vehicles[currentIndex]) {
            const vehicle = vehicles[currentIndex];
            const lat = parseFloat(vehicle.latest_telemetry.lat);
            const long = parseFloat(vehicle.latest_telemetry.long);
            if (!isNaN(lat) && !isNaN(long)) {
                map.flyTo([lat, long], 15, { animate: true, duration: 1 });
            }
        }
    }, [currentIndex, vehicles, map]);

    return null;
};


// Main VehicleMap Component
export const VehicleMap: React.FC<VehicleMapProps> = ({ vehicles }) => {
  const vehiclesWithLocation = vehicles.filter(
    (v): v is VehicleWithValidCoords =>
      v.latest_telemetry != null &&
      isValidCoordinateString(v.latest_telemetry.lat) &&
      isValidCoordinateString(v.latest_telemetry.long)
  );
  const [currentVehicleIndex, setCurrentVehicleIndex] = useState<number | null>(
    vehiclesWithLocation.length > 0 ? 0 : null
  );

  const defaultCenter: LatLngExpression = [51.505, -0.09];
  const defaultZoom = 5;

  let initialBounds: LatLngBounds | null = null;
  if (vehiclesWithLocation.length > 0) {
    const latLngs: LatLngExpression[] = [];
    vehiclesWithLocation.forEach(v => {
        const lat = parseFloat(v.latest_telemetry.lat);
        const long = parseFloat(v.latest_telemetry.long);
        if (!isNaN(lat) && !isNaN(long)) latLngs.push([lat, long]);
    });
    if (latLngs.length > 0) {
        try { initialBounds = new LatLngBounds(latLngs); }
        catch (e) { console.error("Error creating LatLngBounds:", e, latLngs); }
    }
  }

  const handleNext = () => {
    if (vehiclesWithLocation.length === 0) return;
    setCurrentVehicleIndex(prevIndex => {
        const next = (prevIndex ?? -1) + 1;
        return next >= vehiclesWithLocation.length ? 0 : next;
    });
  };

  const handlePrevious = () => {
    if (vehiclesWithLocation.length === 0) return;
    setCurrentVehicleIndex(prevIndex => {
        const prev = (prevIndex ?? 0) - 1;
        return prev < 0 ? vehiclesWithLocation.length - 1 : prev;
    });
  };

  const currentVehicle = currentVehicleIndex !== null ? vehiclesWithLocation[currentVehicleIndex] : null;

  if (vehiclesWithLocation.length === 0) {
    return (
      <div className="rounded-md border p-4 text-center text-muted-foreground h-[600px] flex items-center justify-center">
        No vehicles with valid location data available to display on the map.
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-hidden relative">
       <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-[1000] bg-background/80 p-2 rounded-md shadow-md flex items-center gap-2">
           <Button
               variant="outline"
               size="icon"
               onClick={handlePrevious}
               disabled={vehiclesWithLocation.length <= 1}
               aria-label="Previous vehicle"
           >
               <ChevronLeft className="h-5 w-5" />
           </Button>
           <div className="text-sm font-medium text-center min-w-[150px] px-2">
               {currentVehicle ? (
                   `${currentVehicle.code} (${currentVehicleIndex! + 1}/${vehiclesWithLocation.length})`
               ) : (
                   `No Vehicle Selected`
               )}
           </div>
           <Button
               variant="outline"
               size="icon"
               onClick={handleNext}
               disabled={vehiclesWithLocation.length <= 1}
               aria-label="Next vehicle"
           >
               <ChevronRight className="h-5 w-5" />
           </Button>
       </div>

      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        scrollWheelZoom={true}
        style={{ height: '600px', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {vehiclesWithLocation.map((vehicle, index) => {
          const lat = parseFloat(vehicle.latest_telemetry.lat);
          const long = parseFloat(vehicle.latest_telemetry.long);        
          if (isNaN(lat) || isNaN(long)) return null;
          return (
            <Marker
              key={vehicle.id}
              position={[lat, long]}
              icon={defaultIcon}
              eventHandlers={{ click: () => setCurrentVehicleIndex(index) }}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">{vehicle.code} ({vehicle.plate})</p>
                  <p>Status: {vehicle.status ?? 'N/A'}</p>
                  <p>Model: {`${vehicle.manufacturer ?? ''} ${vehicle.model ?? ''}`.trim() || 'N/A'}</p>
                  {/* Uses the locally defined formatDateTime */}
                  <p>Last Update: {formatDateTime(vehicle.latest_telemetry.timestamp)}</p>
                  <p>Coords: {lat.toFixed(5)}, {long.toFixed(5)}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
        <MapController
            vehicles={vehiclesWithLocation}
            currentIndex={currentVehicleIndex}
            initialBounds={initialBounds}
        />
      </MapContainer>
    </div>
  );
};
