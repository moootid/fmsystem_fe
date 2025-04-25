// src/components/vehicles/ViewVehicleDialog.tsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import apiService from "@/services/apiService";
import { Vehicle } from "@/types/vehicle";

interface ViewVehicleDialogProps {
    vehicleId: string | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

// Helper component to display details
const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="grid grid-cols-3 gap-2 py-1">
        <dt className="font-medium text-muted-foreground">{label}</dt>
        <dd className="col-span-2">{value ?? <span className="text-muted-foreground italic">N/A</span>}</dd>
    </div>
);


export const ViewVehicleDialog = ({
    vehicleId,
    isOpen,
    onOpenChange,
}:any) => {
    const {
        data: vehicle,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["vehicle", vehicleId],
        queryFn: () =>
            apiService.vehicles.getById(vehicleId!).then((res: any) => res.data),
        enabled: !!vehicleId && isOpen,
        refetchOnWindowFocus: false,
        retry: 1,
    });

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

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Vehicle Details</DialogTitle>
                    <DialogDescription>
                        Viewing details for vehicle {vehicle?.code ?? '...'}.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
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
                                Could not load vehicle details. {error?.message}
                            </AlertDescription>
                        </Alert>
                    )}
                    {!isLoading && !isError && vehicle && (
                        <dl className="space-y-2">
                            <DetailItem label="ID" value={vehicle.id} />
                            <DetailItem label="Code" value={vehicle.code} />
                            <DetailItem label="Plate" value={vehicle.plate} />
                            <DetailItem label="VIN" value={vehicle.vin} />
                            <DetailItem label="Manufacturer" value={vehicle.manufacturer} />
                            <DetailItem label="Model" value={vehicle.model} />
                            <DetailItem label="Year" value={vehicle.make_year} />
                            <DetailItem label="Status" value={vehicle.status} />
                            <DetailItem label="Type" value={vehicle.type} />
                            <DetailItem label="Color" value={vehicle.color} />
                            <DetailItem label="IoT Devices" value={vehicle.iot_devices_count} />
                            <DetailItem label="Last Latitude" value={vehicle.latest_telemetry?.lat} />
                            <DetailItem label="Last Longitude" value={vehicle.latest_telemetry?.long} />
                            <DetailItem label="Last Telemetry" value={formatDateTime(vehicle.latest_telemetry?.timestamp)} />
                        </dl>
                    )}
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
