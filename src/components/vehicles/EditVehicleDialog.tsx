// src/components/vehicles/EditVehicleDialog.tsx
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
import { Vehicle } from "@/types/vehicle";
import { EditVehicleForm } from ".//EditVehicleForm";

interface EditVehicleDialogProps {
    vehicleId: string | null; // ID of the vehicle to edit
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export const EditVehicleDialog: React.FC<EditVehicleDialogProps> = ({
    vehicleId,
    isOpen,
    onOpenChange,
    onSuccess,
}) => {
    const {
        data: vehicleData,
        isLoading,
        isError,
        error,
    } = useQuery<Vehicle, Error>({
        queryKey: ["vehicle", vehicleId],
        queryFn: () => apiService.vehicles.getById(vehicleId!),
        refetchOnWindowFocus: false,
        retry: 1,
    });

    const handleSuccess = () => {
        onOpenChange(false);
        onSuccess?.();
    };

    const handleClose = () => {
        onOpenChange(false);
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Edit Vehicle</DialogTitle>
                    <DialogDescription>
                        Update the details for this vehicle.
                    </DialogDescription>
                </DialogHeader>
                {isLoading && (
                    <div className="flex justify-center items-center h-40">
                        <LoadingSpinner />
                    </div>
                )}
                {isError && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error Loading Vehicle Data</AlertTitle>
                        <AlertDescription>
                            Could not load data for editing. {error?.message}
                        </AlertDescription>
                    </Alert>
                )}
                {!isLoading && !isError && vehicleData && (
                    <EditVehicleForm
                        vehicle={vehicleData}
                        onSuccess={handleSuccess}
                        onCancel={handleClose}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
};