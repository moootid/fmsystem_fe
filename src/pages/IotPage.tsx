// src/pages/IotPage.tsx
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { AlertCircle } from "lucide-react";

// Import your new IoT components
import { IotDeviceList } from "@/components/iot/IotDeviceList";
import { CreateIotDeviceDialog } from "@/components/iot/CreateIotDeviceDialog";
import { ViewIotDeviceDialog } from "@/components/iot/ViewIotDeviceDialog";
import { EditIotDeviceDialog } from "@/components/iot/EditIotDeviceDialog";
import { DeleteIotDeviceDialog } from "@/components/iot/DeleteIotDeviceDialog";

// Import types and services
import apiService from "@/services/apiService";
import { IotDevice } from "@/types/iotDevice";

export default function IotPage() {
    // State for controlling dialogs
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [viewingDeviceId, setViewingDeviceId] = useState<string | null>(null);
    const [editingDeviceId, setEditingDeviceId] = useState<string | null>(null);
    const [deletingDevice, setDeletingDevice] = useState<{ id: string; macAddress: string } | null>(null);

    const isViewOpen = !!viewingDeviceId;
    const isEditOpen = !!editingDeviceId;
    const isDeleteOpen = !!deletingDevice;

    // Fetch IoT device list data
    const {
        data: iotDevices,
        isLoading,
        error,
        isError,
        refetch,
    } = useQuery<IotDevice[], Error>({
        queryKey: ["iotDevices"], // Query key for IoT devices
        queryFn: () => apiService.iotDevices.list().then((res: any) => res.data), // Adjust if API wraps data
        refetchOnWindowFocus: false,
        // Add error handling if needed via onError and toast
    });

    // --- Action Handlers (Dialogs) ---
    const handleView = (deviceId: string) => setViewingDeviceId(deviceId);
    const handleEdit = (deviceId: string) => setEditingDeviceId(deviceId);
    const handleDelete = (deviceId: string, macAddress: string) => setDeletingDevice({ id: deviceId, macAddress: macAddress });
    // --- End Action Handlers ---

    if (isError) {
        // Toast might be handled by apiService.handleApiError if used in query's onError
        console.error("Error fetching IoT devices:", error);
        return (
            <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error Fetching IoT Devices</AlertTitle>
                    <AlertDescription>
                        Could not load IoT device data. Please try again later.
                        <div className="mt-4">
                            <Button onClick={() => refetch()} variant="secondary"> Try Again </Button>
                        </div>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Manage IoT Devices</h1>
                <div className="flex gap-2 items-center">
                    {/* Create Dialog Trigger */}
                    <CreateIotDeviceDialog
                        isOpen={isCreateOpen}
                        onOpenChange={setIsCreateOpen}
                        // onSuccess={() => refetch()} // Optionally refetch list on success
                    />
                </div>
            </div>

            {/* Show loading spinner overlaying the content area */}
            {isLoading && (
                <div className="flex justify-center items-center h-64">
                    <LoadingSpinner />
                </div>
            )}

            {/* Conditionally render Table View (only when not loading) */}
            {!isLoading && (
                 <IotDeviceList
                    // Pass the actual data array, handle potential nesting if necessary
                    iotDevices={iotDevices || []}
                    isLoading={isLoading} // Pass loading state to list for its internal handling
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            {/* Render Modals/Dialogs */}
            <ViewIotDeviceDialog
                deviceId={viewingDeviceId}
                isOpen={isViewOpen}
                onOpenChange={(open) => !open && setViewingDeviceId(null)}
            />
            <EditIotDeviceDialog
                deviceId={editingDeviceId}
                isOpen={isEditOpen}
                onOpenChange={(open) => !open && setEditingDeviceId(null)}
                // onSuccess={() => refetch()} // Optionally refetch list on success
            />
            <DeleteIotDeviceDialog
                deviceId={deletingDevice?.id ?? null}
                deviceMacAddress={deletingDevice?.macAddress ?? null}
                isOpen={isDeleteOpen}
                onOpenChange={(open) => !open && setDeletingDevice(null)}
                // onSuccess={() => refetch()} // Optionally refetch list on success
            />
        </div>
    );
}