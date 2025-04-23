import React, { useEffect, useState } from 'react';
import { Socket, Channel } from 'phoenix';
import { AuthUtils } from '@/lib/authUtils';

// ——— Configuration ———
const WS_ENDPOINT = 'ws://localhost:4000/socket';  // Phoenix WebSocket URL
const CHANNEL_TOPIC = 'vehicles:live';            // Phoenix Channel topic

// Vehicle interface to type incoming data
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
 * listens for "vehicle_created" events, and updates the UI in real time.
 */
export default function VehicleLiveUpdater() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [error, setError] = useState<string | null>(null);
    const token = AuthUtils.getToken();

    useEffect(() => {
        // Initialize Phoenix Socket
        const socket = new Socket(WS_ENDPOINT, {
            params: { token },
            logger: (kind, msg, data) => console.debug(`${kind}: ${msg}`, data),
        });

        // Connect socket
        socket.connect();

        // Join the channel
        const channel: Channel = socket.channel(CHANNEL_TOPIC, {});
        channel
            .join()
            .receive('ok', (resp) => {
                console.info('✅ Joined channel:', CHANNEL_TOPIC, resp);
            })
            .receive('error', (resp) => {
                console.error('❌ Failed to join channel:', resp);
                setError('Failed to join live channel.');
            });
        // Listen for initial vehicles
        channel.on('initial_vehicles', (payload: { data: Vehicle[] }) => {
            console.log('📥 Initial vehicles:', payload.data);
            setVehicles(payload.data);
        });

        // Listen for vehicle_created events
        channel.on('vehicle_created', (payload: { data: Vehicle }) => {
            console.log('📥 vehicle_created:', payload.data);
            setVehicles((prev) => [...prev, payload.data]);
        });

        // Listen for vehicle_deleted events
        channel.on('vehicle_deleted', (payload: { id: number }) => {
            console.log('📥 vehicle_deleted:', payload.id)
            setVehicles((prev) => prev.filter((v) => v.id !== payload.id));
        });
        // Listen for vehicle_updated events
        channel.on('vehicle_updated', (payload: { data: Vehicle }) => {
            console.log('📥 vehicle_updated:', payload.data);
            setVehicles((prev) =>
                prev.map((v) => (v.id === payload.data.id ? { ...v, ...payload.data } : v))
            );
        });

        // Optional: handle channel errors
        channel.onError((err) => {
            console.error('Channel error:', err);
            setError('Channel encountered an error.');
        });

        // Optional: handle unexpected socket closure
        socket.onClose((event) => {
            console.warn('WebSocket closed:', event);
            // You can implement reconnection logic here if desired
        });

        // Cleanup on unmount
        return () => {
            channel.leave();
            socket.disconnect();
        };
    }, [token]);

    if (error) {
        return <div className="text-red-600">Error: {error}</div>;
    }

    return (
        <div className="p-4">
            <h2 className="text-xl font-semibold mb-2">Live Vehicles</h2>
            {vehicles.length === 0 ? (
                <p>No vehicles created yet.</p>
            ) : (
                <ul className="space-y-1">
                    {vehicles.map((v) => (
                        <li key={v.id} className="border p-2 rounded shadow-sm">
                            <p><strong>Code:</strong> {v.code}</p>
                            <p><strong>VIN:</strong> {v.vin}</p>
                            <p><strong>Make:</strong> {v.manufacturer} {v.model} ({v.make_year})</p>
                            <p><strong>Status:</strong> {v.status}</p>
                            <p><strong>Type:</strong> {v.type}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
