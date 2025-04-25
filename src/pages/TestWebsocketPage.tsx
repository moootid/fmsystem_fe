import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Socket, Channel } from "phoenix";
import { AuthUtils } from "@/lib/authUtils";

// --- AG Grid Imports ---
// AG Grid Imports
import {
  AllCommunityModule,
  ModuleRegistry,
  ColDef,
  GridReadyEvent,
  // RowClickedEvent, // Add if needed for row click navigation
  themeQuartz,
  colorSchemeDarkBlue,
  CellStyle,
  CellClassParams,
  GridApi,
  GetRowIdParams,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";

// Register the required AG Grid modules
// Register AG Grid Community modules
ModuleRegistry.registerModules([AllCommunityModule]);
const themeDarkBlue = themeQuartz.withPart(colorSchemeDarkBlue);
// +++++++++++++++++++++++


// --- Configuration ---
const WS_ENDPOINT = "ws://localhost:4000/socket"; // Phoenix WebSocket URL
const CHANNEL_TOPIC = "vehicles:live"; // Phoenix Channel topic

// Vehicle interface remains the same
interface Vehicle {
  id: number;
  code: string;
  vin: string;
  manufacturer: string;
  model: string;
  make_year: number;
  status: string;
  type: string;
}

/**
 * VehicleLiveUpdater
 * Connects to Phoenix socket, joins the vehicles:live channel,
 * listens for vehicle events, and updates the AG Grid in real time with highlighting.
 */
export default function VehicleLiveUpdater() {
  // State for vehicles remains, AG Grid will use this indirectly via API
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastChangedVehicleId, setLastChangedVehicleId] = useState<
    number | null
  >(null);
  const lastChangedTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- AG Grid Refs and State ---
  const gridRef = useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = useState<GridApi | null>(null);

  const token = AuthUtils.getToken();

  // --- AG Grid Column Definitions ---
  const columnDefs = useMemo<ColDef[]>(
    () => [
      { field: "id", headerName: "ID", width: 90, sortable: true },
      { field: "code", headerName: "Code", flex: 1, sortable: true },
      { field: "vin", headerName: "VIN", flex: 1, sortable: true },
      {
        field: "manufacturer",
        headerName: "Manufacturer",
        flex: 1,
        sortable: true,
      },
      { field: "model", headerName: "Model", flex: 1, sortable: true },
      {
        field: "make_year",
        headerName: "Year",
        width: 100,
        sortable: true,
      },
      { field: "status", headerName: "Status", flex: 1, sortable: true },
      { field: "type", headerName: "Type", flex: 1, sortable: true },
      /*
      coolant_temp
engine_load
fuel
inserted_at
ip
lat
long
rpm
speed
status
      */
      { field: "latest_telemetry.speed", headerName: "Speed", flex: 1, sortable: true },
      { field: "latest_telemetry.rpm", headerName: "RPM", flex: 1, sortable: true },
      { field: "latest_telemetry.coolant_temp", headerName: "Coolant Temp", flex: 1, sortable: true },
      { field: "latest_telemetry.engine_load", headerName: "Engine Load", flex: 1, sortable: true },
      { field: "latest_telemetry.fuel", headerName: "Fuel", flex: 1, sortable: true },
      { field: "latest_telemetry.ip", headerName: "IP Address", flex: 1, sortable: false },
      { field: "latest_telemetry.inserted_at", headerName: "Inserted At", flex: 1, sortable: true },
      { field: "latest_telemetry.long", headerName: "Longitude", flex: 1, sortable: true },

      { field: "latest_telemetry.lat", headerName: "Latitude", flex: 1, sortable: true },
    ],
    [],
  );

  // --- AG Grid Row ID Getter ---
  const getRowId = useCallback((params: GetRowIdParams<Vehicle>) => {
    return params.data.id.toString(); // Use vehicle ID as the row ID
  }, []);

  // --- AG Grid Ready Callback ---
  const onGridReady = useCallback((params: GridReadyEvent) => {
    console.log("AG Grid Ready");
    setGridApi(params.api);
    // Apply initial data if it arrived before grid was ready
    if (vehicles.length > 0) {
      console.log("Applying initial data to ready grid");
      params.api.setGridOption("rowData", vehicles);
    }
  }, [vehicles]); // Re-run if vehicles state changes before grid is ready

  // --- Highlight Handling ---
  const handleLastChanged = useCallback(
    (vehicleId: number) => {
      if (lastChangedTimeoutRef.current) {
        clearTimeout(lastChangedTimeoutRef.current);
      }

      setLastChangedVehicleId(vehicleId);

      if (gridApi) {
        const node = gridApi.getRowNode(vehicleId.toString());
        if (node) {
          // Redraw only the specific node for efficiency
          gridApi.redrawRows({ rowNodes: [node] });
        } else {
          // If node not found (e.g., for 'add'), redraw all might be needed
          // or rely on the transaction to add the row correctly.
          // A full redraw is a simpler fallback.
          gridApi.redrawRows();
        }
      }

      const timerId = setTimeout(() => {
        const currentLastChangedId = vehicleId; // Capture the ID for the timeout
        setLastChangedVehicleId((prevId) =>
          prevId === currentLastChangedId ? null : prevId,
        ); // Only clear if it's still the same ID

        // Trigger grid redraw again to remove highlight
        if (gridApi) {
          const node = gridApi.getRowNode(currentLastChangedId.toString());
          if (node) {
            gridApi.redrawRows({ rowNodes: [node] });
          } else {
            // Fallback if node somehow gone, redraw all might be needed
            // but less likely needed when *removing* highlight
            // gridApi.redrawRows();
          }
        }
      }, 3000); // Highlight for 3 seconds

      lastChangedTimeoutRef.current = timerId;
    },
    [gridApi], // Depend on gridApi being available
  );

  // --- WebSocket Effect ---
  useEffect(() => {
    const socket = new Socket(WS_ENDPOINT, { params: { token } });
    socket.connect();
    const channel: Channel = socket.channel(CHANNEL_TOPIC, {});

    channel
      .join()
      .receive("ok", (resp) => {
        console.info("✅ Joined channel:", CHANNEL_TOPIC, resp);
      })
      .receive("error", (resp) => {
        console.error("❌ Failed to join channel:", resp);
        setError("Failed to join live channel.");
      });

    // --- Event Handlers using AG Grid API ---

    channel.on("initial_vehicles", (payload: { data: Vehicle[] }) => {
      console.log("📥 Initial vehicles:", payload.data);
      setVehicles(payload.data); // Update React state
      if (gridApi) {
        console.log("Applying initial data via gridApi");
        gridApi.setGridOption("rowData", payload.data); // Set data in AG Grid
      }
    });

    channel.on("vehicle_created", (payload: { data: Vehicle }) => {
      console.log("📥 vehicle_created:", payload.data);
      setVehicles((prev) => [payload.data, ...prev]);
      if (gridApi) {
        gridApi.applyTransaction({ add: [payload.data], addIndex: 0 });
      }
      handleLastChanged(payload.data.id);
    });

    channel.on("vehicle_deleted", (payload: { id: number }) => {
      console.log("📥 vehicle_deleted:", payload.id);
      setVehicles((prev) => prev.filter((v) => v.id !== payload.id));
      if (gridApi) {
        // Find the node to remove. getRowId ensures we can use the ID directly.
        const nodeToRemove = gridApi.getRowNode(payload.id.toString());
        if (nodeToRemove) {
          gridApi.applyTransaction({ remove: [nodeToRemove.data] });
        } else {
          console.warn(`Could not find node with ID ${payload.id} to remove.`);
          // As a fallback, you might force a refresh, but ideally getRowId works
          // gridApi.setGridOption('rowData', vehicles.filter(v => v.id !== payload.id));
        }
      }
    });

    channel.on("vehicle_updated", (payload: { data: Vehicle }) => {
      console.log("📥 vehicle_updated:", payload.data);
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === payload.data.id ? { ...v, ...payload.data } : v,
        ),
      );
      if (gridApi) {
        gridApi.applyTransaction({ update: [payload.data] });
      }
      handleLastChanged(payload.data.id);
    });

    channel.onError((err) => {
      console.error("Channel error:", err);
      setError("Channel encountered an error.");
    });

    socket.onClose((event) => {
      console.warn("WebSocket closed:", event);
    });

    // Cleanup
    return () => {
      if (channel) channel.leave();
      if (socket) socket.disconnect();
      if (lastChangedTimeoutRef.current) {
        clearTimeout(lastChangedTimeoutRef.current);
      }
      console.log("WebSocket Cleanup");
    };
  }, [token, gridApi, handleLastChanged]); // Add gridApi and handleLastChanged dependencies

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600 text-lg font-semibold">
        Error: {error}
      </div>
    );
  }

  // --- AG Grid Row Class Rules for Highlighting ---
  const rowClassRules = useMemo(() => {
    return {
      "ag-row-highlight": (params: { data?: Vehicle }) =>
        params.data?.id === lastChangedVehicleId,
    };
  }, [lastChangedVehicleId]);

  return (
    <div className="mx-auto p-6  min-h-screen flex flex-col">
      <h2 className="text-3xl font-bold mb-6 border-b pb-2">
        Live Vehicle Updates
      </h2>

      {/* AG Grid Component */}
      <div
        className="ag-theme-quartz flex-grow" // Use flex-grow to fill available space
      >
        <AgGridReact
          ref={gridRef}
          columnDefs={columnDefs}
          getRowId={getRowId}
          onGridReady={onGridReady}
          rowClassRules={rowClassRules}
          pagination={true}
          paginationPageSize={20}
          paginationPageSizeSelector={[20, 50, 100]}
          domLayout="autoHeight" // Or 'normal' with fixed container height
          animateRows={true}
          theme={themeDarkBlue}
        // No need to set rowData here if onGridReady handles initial load
        // and transactions handle updates
        />
      </div>
    </div>
  );
}
