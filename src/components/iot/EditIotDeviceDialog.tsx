// src/components/iot/EditIotDeviceDialog.tsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import apiService from "@/services/apiService";
import { IotDevice } from "@/types/iotDevice";
import { EditIotDeviceForm } from "./EditIotDeviceForm"; // Import the edit form

interface EditIotDeviceDialogProps {
    deviceId: string | null; // ID of the device to edit
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void; // Optional callback on success
}

export const EditIotDeviceDialog: React.FC<EditIotDeviceDialogProps> = ({
    deviceId,
    isOpen,
    onOpenChange,
    onSuccess,
}) => {

    const fetchDevice = (id: string | null) => {
        if (!id) return Promise.resolve(null);
        console.log("Fetching IoT device for edit:", id);
        // Adjust if API response wraps data: .then(res => res.data)
        return apiService.iotDevices.getById(id).then((res: any) => res.data);
    }

    const {
        data: deviceData,
        isLoading,
        isError,
        error,
        isFetching, // Use isFetching to show loading during refetches
    } = useQuery<IotDevice | null, Error>({
        queryKey: ["iotDevice", deviceId], // Use the same key as View dialog
        queryFn: () => fetchDevice(deviceId),
        enabled: !!deviceId && isOpen, // Only enable when dialog is open with an ID
        refetchOnWindowFocus: false,
        retry: 1,
    });

    const handleSuccess = () => {
        onOpenChange(false); // Close dialog
        onSuccess?.();
    };

    const handleClose = () => {
        onOpenChange(false);
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Edit IoT Device</DialogTitle>
                    <DialogDescription>
                        Update the details for this IoT device. MAC Address cannot be changed.
                    </DialogDescription>
                </DialogHeader>

                {/* Show loading spinner when initially loading or refetching */}
                {(isLoading || isFetching) && !isError && (
                    <div className="flex justify-center items-center h-40">
                        <LoadingSpinner />
                    </div>
                )}

                {/* Show error message if fetching failed */}
                {isError && !isFetching && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error Loading Device Data</AlertTitle>
                        <AlertDescription>
                            Could not load data for editing. {error?.message}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Render form only when data is loaded, not fetching, and no error */}
                {!isLoading && !isError && !isFetching && deviceData && (
                    <EditIotDeviceForm
                        device={deviceData}
                        onSuccess={handleSuccess}
                        onCancel={handleClose}
                    />
                )}

                {/* Handle case where device might not be found */}
                 {!isLoading && !isError && !isFetching && !deviceData && deviceId && (
                     <p className="text-center text-muted-foreground py-4">Device not found.</p>
                 )}
            </DialogContent>
        </Dialog>
    );
};