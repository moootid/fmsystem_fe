// src/pages/IotPageTest.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '@/services/apiService';
import { IotDevice, CreateIotDevicePayload, UpdateIotDevicePayload } from '@/types/iotDevice'; // Adjust path if needed

// --- Main Test Page Component ---
export default function IotPageTest() {
    const queryClient = useQueryClient();

    // --- State for Forms ---
    // Create form state
    const [createMacAddress, setCreateMacAddress] = useState('');
    const [createModel, setCreateModel] = useState('');
    const [createHwVersion, setCreateHwVersion] = useState('');
    const [createSwVersion, setCreateSwVersion] = useState('');
    const [createStatus, setCreateStatus] = useState('');
    const [createNote, setCreateNote] = useState('');
    const [createVehicleId, setCreateVehicleId] = useState(''); // Keep as string, handle empty/null on submit
    const [createApiAuthId, setCreateApiAuthId] = useState(''); // Keep as string

    // Update form state
    const [updateId, setUpdateId] = useState('');
    const [updateModel, setUpdateModel] = useState('');
    const [updateHwVersion, setUpdateHwVersion] = useState('');
    const [updateSwVersion, setUpdateSwVersion] = useState('');
    const [updateStatus, setUpdateStatus] = useState('');
    const [updateNote, setUpdateNote] = useState('');
    const [updateVehicleId, setUpdateVehicleId] = useState('');
    const [updateApiAuthId, setUpdateApiAuthId] = useState('');


    // --- Fetch IoT Devices Query ---
    const {
        data: iotDevices = [], // Default to empty array
        isLoading: isLoadingDevices,
        isError: isFetchError,
        error: fetchError,
        refetch: refetchDevices,
    } = useQuery<IotDevice[], Error>({
        queryKey: ['testIotDevices'], // Unique key for this test page
        queryFn: () => apiService.iotDevices.list().then((response:any) => response.data), // Assuming list returns { data: [...] }
        // If apiService.iotDevices.list() directly returns IotDevice[], remove .then()
    });

    // --- Create IoT Device Mutation ---
    const {
        mutate: createDevice,
        isPending: isCreating,
        error: createError,
    } = useMutation<IotDevice, Error, CreateIotDevicePayload>({
        mutationFn: (payload) => apiService.iotDevices.create(payload).then((res:any) => res.data), // Assuming create returns { data: {...} }
        // If apiService.iotDevices.create() directly returns IotDevice, remove .then()
        onSuccess: (data) => {
            console.log('Create Success:', data);
            alert(`IoT Device "${data.mac_address}" created successfully! (ID: ${data.id})`);
            queryClient.invalidateQueries({ queryKey: ['testIotDevices'] }); // Refetch the list
            // Clear form
            setCreateMacAddress('');
            setCreateModel('');
            setCreateHwVersion('');
            setCreateSwVersion('');
            setCreateStatus('');
            setCreateNote('');
            setCreateVehicleId('');
            setCreateApiAuthId('');
        },
        onError: (error) => {
            console.error('Create Error:', error);
            alert(`Failed to create IoT Device: ${error.message}`);
            // Optionally use apiService.handleApiError here if it provides useful formatting
        },
    });

    // --- Update IoT Device Mutation ---
    const {
        mutate: updateDevice,
        isPending: isUpdating,
        error: updateError,
    } = useMutation<IotDevice, Error, { id: string; payload: UpdateIotDevicePayload }>({
        mutationFn: ({ id, payload }) => apiService.iotDevices.update(id, payload).then((res:any) => res.data), // Assuming update returns { data: {...} }
        // If apiService.iotDevices.update() directly returns IotDevice, remove .then()
        onSuccess: (data) => {
            console.log('Update Success:', data);
            alert(`IoT Device (ID: ${data.id}) updated successfully!`);
            queryClient.invalidateQueries({ queryKey: ['testIotDevices'] });
            // Clear form
            setUpdateId('');
            setUpdateModel('');
            setUpdateHwVersion('');
            setUpdateSwVersion('');
            setUpdateStatus('');
            setUpdateNote('');
            setUpdateVehicleId('');
            setUpdateApiAuthId('');
        },
        onError: (error) => {
            console.error('Update Error:', error);
            alert(`Failed to update IoT Device: ${error.message}`);
        },
    });

    // --- Delete IoT Device Mutation ---
    const {
        mutate: deleteDevice,
        isPending: isDeleting,
        error: deleteError,
    } = useMutation<void, Error, string>({ // Takes ID string
        mutationFn: (id) => apiService.iotDevices.delete(id),
        onSuccess: (_, deletedId) => {
            console.log('Delete Success: ID', deletedId);
            alert(`IoT Device (ID: ${deletedId}) deleted successfully!`);
            queryClient.invalidateQueries({ queryKey: ['testIotDevices'] });
        },
        onError: (error, deletedId) => {
            console.error('Delete Error for ID:', deletedId, error);
            alert(`Failed to delete IoT Device (ID: ${deletedId}): ${error.message}`);
        },
    });


    // --- Event Handlers ---
    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!createMacAddress) {
            alert('MAC Address is required for creating an IoT Device.');
            return;
        }
        const payload: CreateIotDevicePayload = {
            mac_address: createMacAddress,
            ...(createModel && { model: createModel }),
            ...(createHwVersion && { hw_version: createHwVersion }),
            ...(createSwVersion && { sw_version: createSwVersion }),
            ...(createStatus && { status: createStatus }),
            ...(createNote && { note: createNote }),
            vehicle_id: createVehicleId || null, // Send null if empty
            api_auth_id: createApiAuthId || null, // Send null if empty
        };
        createDevice(payload);
    };

    const handleUpdateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!updateId) {
            alert('IoT Device ID is required for updating.');
            return;
        }
        // Construct payload with only fields that have values in the form
        // Allows selective updates and sending null to clear linked IDs
        const payload: UpdateIotDevicePayload = {
            ...(updateModel !== undefined && { model: updateModel || null }), // Send null if cleared
            ...(updateHwVersion !== undefined && { hw_version: updateHwVersion || null }),
            ...(updateSwVersion !== undefined && { sw_version: updateSwVersion || null }),
            ...(updateStatus !== undefined && { status: updateStatus || null }),
            ...(updateNote !== undefined && { note: updateNote || null }),
            vehicle_id: updateVehicleId || null, // Send null if empty in form
            api_auth_id: updateApiAuthId || null, // Send null if empty in form
        };

        // Prevent sending empty payload if no fields were filled
        if (Object.keys(payload).length === 0) {
             alert("Please provide at least one field to update.");
             return;
        }
        // Or refine: check if payload is different from original values before sending

        updateDevice({ id: updateId, payload });
    };

    const handleDeleteClick = (id: string, macAddress: string) => {
        if (window.confirm(`Are you sure you want to delete the device "${macAddress}" (ID: ${id})?`)) {
            deleteDevice(id);
        }
    };

    // Helper to render linked item ID or 'N/A'
    const renderLinkedId = (item: { id: string } | null | undefined) => {
        return item?.id ? <code style={{ fontSize: '0.8em' }}>{item.id}</code> : 'N/A';
    }

    // --- Render Logic ---
    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <h1>IoT Device Backend Test Page</h1>
            <hr style={{ margin: '20px 0' }} />

            {/* --- CREATE FORM --- */}
            <section>
                <h2>Create New IoT Device</h2>
                <form onSubmit={handleCreateSubmit} style={{ marginBottom: '10px', display: 'grid', gridTemplateColumns: '150px 1fr', gap: '5px 10px', alignItems: 'center' }}>
                    <label>MAC Address*:</label>
                    <input type="text" value={createMacAddress} onChange={(e) => setCreateMacAddress(e.target.value)} required disabled={isCreating} placeholder="e.g., 00:11:22:AA:BB:CC"/>

                    <label>Model:</label>
                    <input type="text" value={createModel} onChange={(e) => setCreateModel(e.target.value)} disabled={isCreating} placeholder="e.g., ESP32-WROOM"/>

                    <label>HW Version:</label>
                    <input type="text" value={createHwVersion} onChange={(e) => setCreateHwVersion(e.target.value)} disabled={isCreating} placeholder="e.g., v1.2"/>

                    <label>SW Version:</label>
                    <input type="text" value={createSwVersion} onChange={(e) => setCreateSwVersion(e.target.value)} disabled={isCreating} placeholder="e.g., v0.1.0"/>

                    <label>Status:</label>
                    <input type="text" value={createStatus} onChange={(e) => setCreateStatus(e.target.value)} disabled={isCreating} placeholder="e.g., Online, Provisioning"/>

                    <label>Note:</label>
                    <input type="text" value={createNote} onChange={(e) => setCreateNote(e.target.value)} disabled={isCreating}/>

                    <label>Vehicle ID (Opt):</label>
                    <input type="text" value={createVehicleId} onChange={(e) => setCreateVehicleId(e.target.value)} disabled={isCreating} placeholder="UUID of vehicle to link"/>

                    <label>API Auth ID (Opt):</label>
                    <input type="text" value={createApiAuthId} onChange={(e) => setCreateApiAuthId(e.target.value)} disabled={isCreating} placeholder="UUID of API key to link"/>

                    <div></div>{/* Spacer */}
                    <button type="submit" disabled={isCreating} style={{ marginTop: '10px', justifySelf: 'start' }}>
                        {isCreating ? 'Creating...' : 'Create Device'}
                    </button>
                    {createError && <p style={{ color: 'red', gridColumn: 'span 2' }}>Error creating: {createError.message}</p>}
                </form>
            </section>

            <hr style={{ margin: '20px 0' }} />

            {/* --- UPDATE FORM --- */}
            <section>
                <h2>Update IoT Device</h2>
                <form onSubmit={handleUpdateSubmit} style={{ marginBottom: '10px', display: 'grid', gridTemplateColumns: '150px 1fr', gap: '5px 10px', alignItems: 'center' }}>
                    <label>ID to Update*:</label>
                    <input type="text" value={updateId} onChange={(e) => setUpdateId(e.target.value)} required placeholder="Enter ID of device to update" disabled={isUpdating} />

                    <label>New Model:</label>
                    <input type="text" value={updateModel} onChange={(e) => setUpdateModel(e.target.value)} placeholder="(empty to clear, unchanged if blank)" disabled={isUpdating} />

                    <label>New HW Version:</label>
                    <input type="text" value={updateHwVersion} onChange={(e) => setUpdateHwVersion(e.target.value)} placeholder="(empty to clear, unchanged if blank)" disabled={isUpdating} />

                    <label>New SW Version:</label>
                    <input type="text" value={updateSwVersion} onChange={(e) => setUpdateSwVersion(e.target.value)} placeholder="(empty to clear, unchanged if blank)" disabled={isUpdating} />

                    <label>New Status:</label>
                    <input type="text" value={updateStatus} onChange={(e) => setUpdateStatus(e.target.value)} placeholder="(empty to clear, unchanged if blank)" disabled={isUpdating} />

                    <label>New Note:</label>
                    <input type="text" value={updateNote} onChange={(e) => setUpdateNote(e.target.value)} placeholder="(empty to clear, unchanged if blank)" disabled={isUpdating} />

                    <label>New Vehicle ID:</label>
                    <input type="text" value={updateVehicleId} onChange={(e) => setUpdateVehicleId(e.target.value)} placeholder="(empty to unlink)" disabled={isUpdating} />

                    <label>New API Auth ID:</label>
                    <input type="text" value={updateApiAuthId} onChange={(e) => setUpdateApiAuthId(e.target.value)} placeholder="(empty to unlink)" disabled={isUpdating} />

                     <div></div>{/* Spacer */}
                    <button type="submit" disabled={isUpdating || !updateId} style={{ marginTop: '10px', justifySelf: 'start' }}>
                        {isUpdating ? 'Updating...' : 'Update Device'}
                    </button>
                    {updateError && <p style={{ color: 'red', gridColumn: 'span 2' }}>Error updating: {updateError.message}</p>}
                </form>
            </section>

            <hr style={{ margin: '20px 0' }} />

            {/* --- LIST DEVICES --- */}
            <section>
                <h2>Existing IoT Devices</h2>
                <button onClick={() => refetchDevices()} disabled={isLoadingDevices}>
                    {isLoadingDevices ? 'Refreshing...' : 'Refresh List'}
                </button>

                {isLoadingDevices && <p>Loading devices...</p>}
                {isFetchError && <p style={{ color: 'red' }}>Error fetching devices: {fetchError?.message}</p>}

                {!isLoadingDevices && !isFetchError && iotDevices.length === 0 && <p>No IoT devices found.</p>}

                {!isLoadingDevices && iotDevices.length > 0 && (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {iotDevices.map((device) => (
                            <li key={device.id} style={{ border: '1px solid #ccc', marginBottom: '15px', padding: '10px' }}>
                                <div><strong>MAC:</strong> {device.mac_address}</div>
                                <div><strong>ID:</strong> {device.id}</div>
                                <div><strong>Model:</strong> {device.model || 'N/A'}</div>
                                <div><strong>HW Ver:</strong> {device.hw_version || 'N/A'} | <strong>SW Ver:</strong> {device.sw_version || 'N/A'}</div>
                                <div><strong>Status:</strong> {device.status || 'N/A'}</div>
                                <div><strong>Note:</strong> {device.note || 'N/A'}</div>
                                <div><strong>Linked Vehicle:</strong> {renderLinkedId(device.vehicle)}</div>
                                <div><strong>Linked API Key:</strong> {renderLinkedId(device.api_auth_token)}</div>
                                {/* Add created/updated at if available */}
                                {/* <div><strong>Created:</strong> {device.inserted_at ? new Date(device.inserted_at).toLocaleString() : 'N/A'}</div> */}
                                <button
                                    onClick={() => handleDeleteClick(device.id, device.mac_address)}
                                    disabled={isDeleting}
                                    style={{ color: 'red', marginLeft: '10px', marginTop: '5px' }}
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
                {deleteError && <p style={{ color: 'red' }}>Error deleting: {deleteError.message}</p>}
            </section>
        </div>
    );
}